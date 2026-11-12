namespace SkillBridge.Application.DTOs.Candidate;

public sealed record CandidateDashboardResponse(
    int Applications,
    int Pending,
    int Shortlisted,
    IReadOnlyList<RecommendedJobResponse> RecommendedJobs);

public sealed record RecommendedJobResponse(
    int Id,
    string Title,
    string Company,
    IReadOnlyList<string> Skills,
    int Match);