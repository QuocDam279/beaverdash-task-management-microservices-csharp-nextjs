using MediatR;
using PM.Application.Contracts;
using PM.Domain.Entities;
using PM.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Sprints.Commands;

public class CreateSprintCommandHandler : IRequestHandler<CreateSprintCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public CreateSprintCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateSprintCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new InvalidOperationException("Project không tồn tại.");

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm Sprint vào Project này.");
        }

        var member = await _dbContext.TeamMembers.FirstOrDefaultAsync(
            tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, 
            cancellationToken);

        if (member == null || (member.Role != "leader" && member.Role != "Owner"))
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền thêm Sprint vào Project này.");

        // Validate name uniqueness in the project
        var normalizedName = request.Name.Trim().ToLower();
        var nameExists = await _dbContext.Sprints.AnyAsync(
            s => s.ProjectId == request.ProjectId && s.Name.Trim().ToLower() == normalizedName,
            cancellationToken);

        if (nameExists)
        {
            throw new InvalidOperationException($"Sprint với tên \"{request.Name}\" đã tồn tại trong dự án này.");
        }

        // Validate dates
        if (request.StartDate.HasValue && request.EndDate.HasValue && request.StartDate.Value > request.EndDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu của Sprint không được lớn hơn ngày kết thúc.");
        }

        if (project.StartDate.HasValue)
        {
            if (request.StartDate.HasValue && request.StartDate.Value.Date < project.StartDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày bắt đầu của Sprint không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
            }
            if (request.EndDate.HasValue && request.EndDate.Value.Date < project.StartDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày kết thúc của Sprint không được nhỏ hơn ngày bắt đầu của dự án ({project.StartDate.Value:yyyy-MM-dd}).");
            }
        }

        if (project.DueDate.HasValue)
        {
            if (request.StartDate.HasValue && request.StartDate.Value.Date > project.DueDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày bắt đầu của Sprint không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
            }
            if (request.EndDate.HasValue && request.EndDate.Value.Date > project.DueDate.Value.Date)
            {
                throw new InvalidOperationException($"Ngày kết thúc của Sprint không được lớn hơn hạn hoàn thành của dự án ({project.DueDate.Value:yyyy-MM-dd}).");
            }
        }

        var sprint = new Sprint
        {
            Id = Guid.CreateVersion7(),
            ProjectId = request.ProjectId,
            Name = request.Name,
            Goal = request.Goal,
            Status = SprintStatus.Future,
            StartDate = request.StartDate.HasValue ? DateTime.SpecifyKind(request.StartDate.Value, DateTimeKind.Utc) : null,
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Sprints.Add(sprint);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return sprint.Id;
    }
}
