using SkillBridge.Application.DTOs.Candidate;

namespace SkillBridge.Application.Interfaces;

public interface ICandidateDashboardService
{
    Task<CandidateDashboardResponse> GetDashboardAsync(
        int userId,
        CancellationToken cancellationToken = default);
}