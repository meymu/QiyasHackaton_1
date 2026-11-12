using MediatR;
using SkillBridge.Application.DTOs.Candidate;
using SkillBridge.Application.Interfaces;
using SkillBridge.Application.Queries.Candidate;

namespace SkillBridge.Application.Handlers.Candidate;

public sealed class GetCandidateDashboardHandler
    : IRequestHandler<GetCandidateDashboardQuery, CandidateDashboardResponse>
{
    private readonly ICandidateDashboardService _service;

    public GetCandidateDashboardHandler(ICandidateDashboardService service)
    {
        _service = service;
    }

    public Task<CandidateDashboardResponse> Handle(
        GetCandidateDashboardQuery request,
        CancellationToken cancellationToken) =>
        _service.GetDashboardAsync(request.UserId, cancellationToken);
}