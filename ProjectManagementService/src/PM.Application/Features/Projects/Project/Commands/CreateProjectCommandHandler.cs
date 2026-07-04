using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

namespace PM.Application.Features.Projects.Project.Commands;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;
    private readonly IPublishEndpoint _publishEndpoint;

    public CreateProjectCommandHandler(
        PM.Application.Contracts.IPMDbContext dbContext,
        PM.Application.Contracts.ICurrentUserService currentUserService,
        IPublishEndpoint publishEndpoint)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        if (!request.TeamId.HasValue)
        {
            throw new InvalidOperationException("Mỗi dự án phải thuộc về một nhóm (TeamId là bắt buộc).");
        }

        var member = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == request.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (member == null || member.Role != "leader")
        {
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền tạo dự án cho nhóm này.");
        }

        var isDuplicate = await _dbContext.Projects.AnyAsync(p => p.TeamId == request.TeamId.Value && p.Name.ToLower() == request.Name.ToLower(), cancellationToken);
        if (isDuplicate)
        {
            throw new InvalidOperationException("Tên dự án đã tồn tại trong nhóm này. Vui lòng chọn tên khác.");
        }

        if (request.StartDate.HasValue && request.DueDate.HasValue && request.StartDate.Value > request.DueDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
        }

        var project = new PM.Domain.Entities.Project
        {
            Id = Guid.CreateVersion7(),
            TeamId = request.TeamId,
            Name = request.Name,
            Description = request.Description,
            Progress = 0,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            IsPublic = request.IsPublic,
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Set<PM.Domain.Entities.Project>().Add(project);

        // Seed 3 default columns for this project
        var defaultColumns = new List<PM.Domain.Entities.BoardColumn>
        {
            new() { Id = Guid.CreateVersion7(), ProjectId = project.Id, Name = "Chưa thực hiện", Position = 1, IsDone = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.CreateVersion7(), ProjectId = project.Id, Name = "Đang thực hiện", Position = 2, IsDone = false, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new() { Id = Guid.CreateVersion7(), ProjectId = project.Id, Name = "Đã hoàn thành", Position = 3, IsDone = true, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };
        _dbContext.BoardColumns.AddRange(defaultColumns);

        project.AddDomainEvent(new PM.Domain.Events.ProjectCreatedEvent(
            project.Id,
            project.Name,
            project.TeamId!.Value,
            currentUserId
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);

        // --- Đồng bộ sang AIAssistant Service qua Event Bus ---
        List<Guid> memberIds = await _dbContext.TeamMembers
            .Where(tm => tm.TeamId == request.TeamId.Value)
            .Select(tm => tm.UserId)
            .ToListAsync(cancellationToken);

        await _publishEndpoint.Publish(new EventBus.Messages.Events.ProjectCreatedEvent
        {
            ProjectId = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = null
        }, cancellationToken);

        await _publishEndpoint.Publish(new EventBus.Messages.Events.ProjectMembersSyncedEvent
        {
            ProjectId = project.Id,
            MemberUserIds = memberIds
        }, cancellationToken);

        return project.Id;
    }
}
