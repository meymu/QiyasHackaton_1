using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SkillBridge.Application.Interfaces;
using SkillBridge.Infrastructure.Context;
using SkillBridge.Infrastructure.Identity;
using SkillBridge.Infrastructure.Repositories;
using SkillBridge.Infrastructure.Services;

namespace SkillBridge.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<SkillBridgeDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;

                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;

                // 5 failed attempts => 5 minute lock (used by AuthService.ValidateCredentialsAsync).
                options.Lockout.AllowedForNewUsers = true;
                options.Lockout.MaxFailedAccessAttempts = 5;
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<SkillBridgeDbContext>();

        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();

        services.AddScoped<ISkillRepository, SkillRepository>();

        services.AddScoped<ICandidateProfileService, CandidateProfileService>();
        services.AddScoped<ICandidateDashboardService, CandidateDashboardService>();
        services.AddScoped<IEmployerProfileService, EmployerProfileService>();
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<ISkillService, SkillService>();

        return services;
    }
}
