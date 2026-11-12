using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SkillBridge.Application.Exceptions;

namespace SkillBridge.Api.Middleware;


public sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ProblemDetails problem;

        switch (exception)
        {
            case RequestValidationException validation:
                problem = new ValidationProblemDetails(
                    validation.Errors.ToDictionary(x => x.Key, x => x.Value))
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "One or more validation errors occurred."
                };
                break;

            case AuthenticationFailedException:
                problem = Create(StatusCodes.Status401Unauthorized, "Authentication failed.", exception.Message);
                break;

            case ForbiddenException:
                problem = Create(StatusCodes.Status403Forbidden, "Forbidden.", exception.Message);
                break;

            case NotFoundException:
                problem = Create(StatusCodes.Status404NotFound, "Not found.", exception.Message);
                break;

            case ConflictException:
                problem = Create(StatusCodes.Status409Conflict, "Conflict.", exception.Message);
                break;

            default:
                logger.LogError(exception, "Unhandled exception for {Method} {Path}",
                    httpContext.Request.Method, httpContext.Request.Path);

                problem = Create(
                    StatusCodes.Status500InternalServerError,
                    "An unexpected error occurred.",
                    detail: null);
                break;
        }

        httpContext.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;

        // Serialize by runtime type, otherwise ValidationProblemDetails.Errors is dropped.
        await httpContext.Response.WriteAsJsonAsync(
            problem,
            problem.GetType(),
            options: null,
            contentType: "application/problem+json",
            cancellationToken: cancellationToken);

        return true;
    }

    private static ProblemDetails Create(int status, string title, string? detail) => new()
    {
        Status = status,
        Title = title,
        Detail = detail
    };
}
