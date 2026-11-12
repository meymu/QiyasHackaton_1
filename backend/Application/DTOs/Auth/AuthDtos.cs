namespace SkillBridge.Application.DTOs.Auth;


public sealed record UserDto(int Id, string Email, string Role, string DisplayName);


public sealed record TokenResult(string AccessToken, DateTime ExpiresAtUtc);


public sealed record AuthResult(string AccessToken, DateTime ExpiresAtUtc, UserDto User);


public sealed record CandidateRegistrationData(
    string FullName,
    string? Headline,
    string Institution,
    string FieldOfStudy,
    string DegreeLevel,
    int GraduationYear,
    string? GitHubUrl,
    string? PortfolioUrl);


public sealed record EmployerRegistrationData(
    string CompanyName,
    string ContactName,
    string? Website);
