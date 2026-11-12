using MediatR;
using SkillBridge.Application.DTOs.Candidate;

namespace SkillBridge.Application.Queries.Candidate;

public sealed record GetCandidateDashboardQuery(int UserId)
    : IRequest<CandidateDashboardResponse>;