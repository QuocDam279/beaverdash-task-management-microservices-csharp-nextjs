using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;
using PM.Domain.Enums;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;

    public CreateTaskCommandHandler(PM.Application.Contracts.IPMDbContext dbContext, PM.Application.Contracts.ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var column = await _dbContext.BoardColumns
            .AsNoTracking()
            .Include(c => c.Project)
            .FirstOrDefaultAsync(c => c.Id == request.BoardColumnId, cancellationToken);

        if (column == null)
            throw new KeyNotFoundException("Không tìm thấy cột Kanban được yêu cầu.");

        if (column.Project == null)
            throw new KeyNotFoundException("Không tìm thấy dự án liên kết với cột Kanban này.");

        if (!column.Project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền thêm Task vào Project này.");
        }

        var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == column.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (requestingMember == null)
            throw new UnauthorizedAccessException("Bạn không có quyền thêm Task vào Project này.");

        var isDuplicateName = await _dbContext.TaskItems
            .AnyAsync(t => t.Title.ToLower() == request.Title.ToLower() && t.BoardColumn!.ProjectId == column.ProjectId, cancellationToken);

        if (isDuplicateName)
            throw new InvalidOperationException($"Một công việc với tên '{request.Title}' đã tồn tại trong dự án này.");

        // Validate dates
        if (request.StartDate.HasValue && request.DueDate.HasValue && request.StartDate.Value > request.DueDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu không được lớn hơn ngày hạn hoàn thành của công việc.");
        }

        if (column.Project != null)
        {
            if (column.Project.StartDate.HasValue)
            {
                if (request.StartDate.HasValue && request.StartDate.Value.Date < column.Project.StartDate.Value.Date)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của công việc không được nhỏ hơn ngày bắt đầu của dự án ({column.Project.StartDate.Value:yyyy-MM-dd}).");
                }
                if (request.DueDate.HasValue && request.DueDate.Value.Date < column.Project.StartDate.Value.Date)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của công việc không được nhỏ hơn ngày bắt đầu của dự án ({column.Project.StartDate.Value:yyyy-MM-dd}).");
                }
            }

            if (column.Project.DueDate.HasValue)
            {
                if (request.StartDate.HasValue && request.StartDate.Value.Date > column.Project.DueDate.Value.Date)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của công việc không được lớn hơn hạn hoàn thành của dự án ({column.Project.DueDate.Value:yyyy-MM-dd}).");
                }
                if (request.DueDate.HasValue && request.DueDate.Value.Date > column.Project.DueDate.Value.Date)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của công việc không được lớn hơn hạn hoàn thành của dự án ({column.Project.DueDate.Value:yyyy-MM-dd}).");
                }
            }
        }



        double sortOrder = request.SortOrder ?? 0;
        if (!request.SortOrder.HasValue)
        {
            var maxSortOrder = await _dbContext.TaskItems
                .Where(t => t.BoardColumnId == request.BoardColumnId)
                .MaxAsync(t => (double?)t.SortOrder, cancellationToken);
            
            sortOrder = (maxSortOrder ?? 0) + 1;
        }

        Guid? sprintId = null;
        if (request.SprintId.HasValue)
        {
            sprintId = request.SprintId.Value == Guid.Empty ? null : request.SprintId.Value;
        }
        else
        {
            var activeSprint = await _dbContext.Sprints
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.ProjectId == column.ProjectId && s.Status == SprintStatus.Active, cancellationToken);
            sprintId = activeSprint?.Id;
        }

        var task = new PM.Domain.Entities.TaskItem
        {
            Id = Guid.CreateVersion7(),
            BoardColumnId = request.BoardColumnId,
            SprintId = sprintId,
            Title = request.Title,
            Description = request.Description,
            Priority = string.IsNullOrEmpty(request.Priority)
                ? null
                : Enum.TryParse<TaskPriority>(request.Priority, true, out var p) ? p : null,
            DueDate = request.DueDate,
            StartDate = request.StartDate,
            SortOrder = sortOrder,
            CreatedByUserId = currentUserId,
            CompletedAt = column.IsDone ? DateTime.UtcNow : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.TaskItems.Add(task);
        
        // Gắn sự kiện tạo Task để ghi log
        task.AddDomainEvent(new PM.Domain.Events.TaskCreatedEvent(column.ProjectId, task.Id, currentUserId, task.Title));
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}

