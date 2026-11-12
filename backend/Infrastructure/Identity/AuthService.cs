using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillBridge.Application.Commands.Auth;
using SkillBridge.Application.DTOs.Auth;
using SkillBridge.Application.Exceptions;
using SkillBridge.Application.Interfaces;
using SkillBridge.Domain.Entities;
using SkillBridge.Domain.Enums;
using SkillBridge.Infrastructure.Context;

namespace SkillBridge.Infrastructure.Identity;

public sealed class AuthService(UserManager<ApplicationUser> userManager, SkillBridgeDbContext db) : IAuthService
{
    public async Task<UserDto> RegisterAsync(RegisterCommand command, CancellationToken ct = default)
    {
        var roleName = command.Role.ToString();

        // Fail fast on missing profile data BEFORE any user row is created.
        if (command.Role == UserRole.Candidate && command.Candidate is null ||
            command.Role == UserRole.Employer && command.Employer is null ||
            !Enum.IsDefined(command.Role))
        {
            throw new InvalidOperationException($"Profile details missing for role '{roleName}'.");
        }

        // The user, role assignment and profile must all succeed or all roll back.
        await using var transaction = await db.Database.BeginTransactionAsync(ct);

        var user = new ApplicationUser
        {
            UserName = command.Email,
            Email = command.Email,
            CreatedAt = DateTime.UtcNow
        };

        var created = await userManager.CreateAsync(user, command.Password);
        if (!created.Succeeded)
            throw MapRegistrationFailure(created);

        var roleResult = await userManager.AddToRoleAsync(user, roleName);
        if (!roleResult.Succeeded)
            throw new InvalidOperationException(
                $"Could not assign role '{roleName}': " +
                string.Join("; ", roleResult.Errors.Select(e => e.Description)));

        switch (command.Role)
        {
            case UserRole.Candidate:
                var cand = command.Candidate!;
                db.CandidateProfiles.Add(new CandidateProfile
                {
                    UserId = user.Id,
                    FullName = cand.FullName.Trim(),
                    Headline = NullIfBlank(cand.Headline),
                    Institution = cand.Institution.Trim(),
                    FieldOfStudy = cand.FieldOfStudy.Trim(),
                    DegreeLevel = cand.DegreeLevel.Trim(),
                    GraduationYear = cand.GraduationYear,
                    GitHubUrl = NullIfBlank(cand.GitHubUrl),
                    PortfolioUrl = NullIfBlank(cand.PortfolioUrl)
                });
                break;

            case UserRole.Employer:
                var emp = command.Employer!;
                db.EmployerProfiles.Add(new EmployerProfile
                {
                    UserId = user.Id,
                    CompanyName = emp.CompanyName.Trim()
                });
                break;
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var displayName = command.Role switch
        {
            UserRole.Candidate => command.Candidate!.FullName.Trim(),
            UserRole.Employer => command.Employer!.CompanyName.Trim(),
            _ => user.Email!
        };

        return new UserDto(user.Id, user.Email!, roleName, displayName);
    }

    public async Task<UserDto> ValidateCredentialsAsync(
        string email, string password, CancellationToken ct = default)
    {
        const string invalid = "Invalid email or password.";

        var user = await userManager.FindByEmailAsync(email)
                   ?? throw new AuthenticationFailedException(invalid);

        if (await userManager.IsLockedOutAsync(user))
            throw new AuthenticationFailedException("Account is temporarily locked. Try again later.");

        if (!await userManager.CheckPasswordAsync(user, password))
        {
            // Counts toward lockout (5 failures => 5 minute lock, see DependencyInjection).
            await userManager.AccessFailedAsync(user);
            throw new AuthenticationFailedException(invalid);
        }

        await userManager.ResetAccessFailedCountAsync(user);

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault()
                   ?? throw new ForbiddenException("This account has no role assigned.");

        var displayName = await GetDisplayNameAsync(user.Id, role, user.Email!, ct);
        return new UserDto(user.Id, user.Email!, role, displayName);
    }

    public async Task<UserDto?> GetByIdAsync(int userId, CancellationToken ct = default)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;

        var roles = await userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? string.Empty;
        var displayName = await GetDisplayNameAsync(user.Id, role, user.Email!, ct);
        return new UserDto(user.Id, user.Email!, role, displayName);
    }

    private async Task<string> GetDisplayNameAsync(
        int userId, string role, string email, CancellationToken ct) =>
        role switch
        {
            nameof(UserRole.Candidate) =>
                await db.CandidateProfiles
                    .Where(profile => profile.UserId == userId)
                    .Select(profile => profile.FullName)
                    .FirstOrDefaultAsync(ct) ?? email,
            nameof(UserRole.Employer) =>
                await db.EmployerProfiles
                    .Where(profile => profile.UserId == userId)
                    .Select(profile => profile.CompanyName)
                    .FirstOrDefaultAsync(ct) ?? email,
            _ => email
        };

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static Exception MapRegistrationFailure(IdentityResult result)
    {
        if (result.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
            return new ConflictException("An account with this email already exists.");

        var errors = result.Errors
            .GroupBy(e => e.Code.StartsWith("Password", StringComparison.Ordinal) ? "Password" : "Email")
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description).ToArray());

        return new RequestValidationException(errors);
    }
}
