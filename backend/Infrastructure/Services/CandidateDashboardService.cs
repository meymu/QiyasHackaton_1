using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.DTOs.Candidate;
using SkillBridge.Application.Exceptions;
using SkillBridge.Application.Interfaces;
using SkillBridge.Infrastructure.Context;

namespace SkillBridge.Infrastructure.Services;

public sealed class CandidateDashboardService : ICandidateDashboardService
{
    private readonly SkillBridgeDbContext _db;

    public CandidateDashboardService(SkillBridgeDbContext db)
    {
        _db = db;
    }

    public async Task<CandidateDashboardResponse> GetDashboardAsync(
        int userId,
        CancellationToken cancellationToken = default)
    {
        var candidate = await _db.CandidateProfiles
            .Include(profile => profile.CandidateSkills)
            .AsNoTracking()
            .FirstOrDefaultAsync(
                profile => profile.UserId == userId,
                cancellationToken);

        if (candidate is null)
            throw new NotFoundException("Candidate profile not found.");

        var candidateSkillIds = candidate.CandidateSkills
            .Select(candidateSkill => candidateSkill.SkillId)
            .ToHashSet();

        var jobs = await _db.Jobs
            .Include(job => job.EmployerProfile)
            .Include(job => job.RequiredSkills)
                .ThenInclude(requiredSkill => requiredSkill.Skill)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var recommendedJobs = jobs
            .Select(job =>
            {
                var matchingSkills = job.RequiredSkills
                    .Count(requiredSkill => candidateSkillIds.Contains(requiredSkill.SkillId));
                var requiredSkillCount = job.RequiredSkills.Count;
                var match = requiredSkillCount == 0
                    ? 0
                    : (int)Math.Round(
                        (double)matchingSkills / requiredSkillCount * 100,
                        MidpointRounding.AwayFromZero);

                return (Job: job, Match: match);
            })
            .OrderByDescending(item => item.Match)
            .ThenByDescending(item => item.Job.CreatedAt)
            .Take(3)
            .Select(item => new RecommendedJobResponse(
                item.Job.Id,
                item.Job.Title,
                item.Job.EmployerProfile.CompanyName,
                item.Job.RequiredSkills
                    .Select(requiredSkill => requiredSkill.Skill.Name)
                    .ToList(),
                item.Match))
            .ToList();

        return new CandidateDashboardResponse(
            Applications: 0,
            Pending: 0,
            Shortlisted: 0,
            RecommendedJobs: recommendedJobs);
    }
}