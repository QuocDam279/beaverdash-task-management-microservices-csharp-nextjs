using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;

    public CreateProjectCommandHandler(PM.Application.Contracts.IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var project = new PM.Domain.Entities.Project
        {
            Id = Guid.NewGuid(),
            TeamId = request.TeamId,
            Name = request.Name,
            Description = request.Description,
            Status = "To Do",
            IsPublic = request.IsPublic,
            CreatedByUserId = request.CreatedByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Set<PM.Domain.Entities.Project>().Add(project);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}

