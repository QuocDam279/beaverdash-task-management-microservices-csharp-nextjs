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
            throw new InvalidOperationException("Board column not found.");

        if (column.Project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers.FirstOrDefaultAsync(tm => tm.TeamId == column.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (requestingMember == null)
                throw new UnauthorizedAccessException("Bạn không có quyền thêm Task vào Project này.");


        }

        var isDuplicateName = await _dbContext.TaskItems
            .AnyAsync(t => t.Title.ToLower() == request.Title.ToLower() && t.BoardColumn!.ProjectId == column.ProjectId, cancellationToken);

        if (isDuplicateName)
            throw new InvalidOperationException($"A task with the name '{request.Title}' already exists in this project.");

        // Validate dates
        if (request.StartDate.HasValue && request.DueDate.HasValue && request.StartDate.Value > request.DueDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu không được lớn hơn ngày hạn hoàn thành của Task.");
        }

        if (column.Project != null)
        {
            if (column.Project.StartDate.HasValue)
            {
                if (request.StartDate.HasValue && request.StartDate.Value < column.Project.StartDate.Value)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được nhỏ hơn ngày bắt đầu của dự án ({column.Project.StartDate.Value:yyyy-MM-dd}).");
                }
                if (request.DueDate.HasValue && request.DueDate.Value < column.Project.StartDate.Value)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của Task không được nhỏ hơn ngày bắt đầu của dự án ({column.Project.StartDate.Value:yyyy-MM-dd}).");
                }
            }

            if (column.Project.DueDate.HasValue)
            {
                if (request.StartDate.HasValue && request.StartDate.Value > column.Project.DueDate.Value)
                {
                    throw new InvalidOperationException($"Ngày bắt đầu của Task không được lớn hơn hạn hoàn thành của dự án ({column.Project.DueDate.Value:yyyy-MM-dd}).");
                }
                if (request.DueDate.HasValue && request.DueDate.Value > column.Project.DueDate.Value)
                {
                    throw new InvalidOperationException($"Hạn hoàn thành của Task không được lớn hơn hạn hoàn thành của dự án ({column.Project.DueDate.Value:yyyy-MM-dd}).");
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

        var task = new PM.Domain.Entities.TaskItem
        {
            Id = Guid.NewGuid(),
            BoardColumnId = request.BoardColumnId,
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
        task.AddDomainEvent(new PM.Domain.Events.TaskCreatedEvent(task.Id, currentUserId, task.Title));
        
        await _dbContext.SaveChangesAsync(cancellationToken);

        return task.Id;
    }
}

