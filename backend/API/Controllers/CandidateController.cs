using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Commands.Candidate;
using SkillBridge.Application.DTOs.Candidate;
using SkillBridge.Application.Exceptions;
using SkillBridge.Application.Interfaces;
using SkillBridge.Application.Queries.Candidate;
using SkillBridge.Domain.Constants;

namespace SkillBridge.Api.Controllers;

[ApiController]
[Route("api/candidates")]
[Authorize(Roles = RoleNames.Candidate)]
public class CandidateController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ICurrentUserService _currentUser;

    public CandidateController(ISender sender, ICurrentUserService currentUser)
    {
        _sender = sender;
        _currentUser = currentUser;
    }

    private int UserId =>
        _currentUser.UserId ?? throw new AuthenticationFailedException("You are not signed in.");

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetMyCandidateProfileQuery(UserId),
            cancellationToken);

        return result is null
            ? NotFound()
            : Ok(result);
    }

    [HttpGet("me/dashboard")]
    public async Task<IActionResult> GetDashboard(
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetCandidateDashboardQuery(UserId),
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("me")]
    public async Task<IActionResult> Create(
        CreateCandidateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new CreateCandidateProfileCommand(
                UserId,
                request.FullName,
                request.Institution,
                request.Headline,
                request.FieldOfStudy,
                request.DegreeLevel,
                request.GraduationYear,
                request.GitHubUrl,
                request.PortfolioUrl),
            cancellationToken);

        return CreatedAtAction(
            nameof(GetMe),
            null,
            result);
    }

    [HttpPut("me")]
    public async Task<IActionResult> Update(
        UpdateCandidateProfileRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new UpdateCandidateProfileCommand(
                UserId,
                request.FullName,
                request.Institution,
                request.Headline,
                request.FieldOfStudy,
                request.DegreeLevel,
                request.GraduationYear,
                request.GitHubUrl,
                request.PortfolioUrl),
            cancellationToken);

        return Ok(result);
    }

    [HttpPost("me/skills/{skillId:int}")]
    public async Task<IActionResult> AddSkill(
        int skillId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new AddCandidateSkillCommand(UserId, skillId),
            cancellationToken);

        return NoContent();
    }

    [HttpDelete("me/skills/{skillId:int}")]
    public async Task<IActionResult> RemoveSkill(
        int skillId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new RemoveCandidateSkillCommand(UserId, skillId),
            cancellationToken);

        return NoContent();
    }

    [HttpDelete("me")]
    public async Task<IActionResult> Delete(
        CancellationToken cancellationToken)
    {
        await _sender.Send(
            new DeleteCandidateProfileCommand(UserId),
            cancellationToken);

        return NoContent();
    }
}
