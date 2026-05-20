using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Events;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.TaskItem.Commands;

public class UpdateTaskDetailsCommandHandler : IRequestHandler<UpdateTaskDetailsCommand, bool>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;

    public UpdateTaskDetailsCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTaskDetailsCommand request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .Include(t => t.BoardColumn)
                .ThenInclude(c => c.Project)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        if (task.BoardColumn.Project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers.AnyAsync(tm => tm.TeamId == task.BoardColumn.Project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền cập nhật Task này.");
        }

        // Chỉ cập nhật những trường có truyền dữ liệu lên
        if (request.DueDate.HasValue)
        {
            // Kiểm tra xem DueDate mới có nhỏ hơn DueDate của SubTask nào không
            var maxSubTaskDueDate = await _dbContext.SubTasks
                .Where(s => s.TaskId == task.Id && s.DueDate.HasValue)
                .Select(s => s.DueDate)
                .OrderByDescending(d => d)
                .FirstOrDefaultAsync(cancellationToken);

            if (maxSubTaskDueDate.HasValue && request.DueDate.Value < maxSubTaskDueDate.Value)
                throw new InvalidOperationException($"Hạn hoàn thành của Task không được nhỏ hơn hạn hoàn thành lớn nhất của các SubTask ({maxSubTaskDueDate.Value:yyyy-MM-dd}).");

            task.DueDate = request.DueDate.Value;
        }

        if (request.StartDate.HasValue)
            task.StartDate = request.StartDate.Value;

        if (!string.IsNullOrEmpty(request.Priority))
            task.Priority = request.Priority;

        // Xử lý riêng logic Giao việc (Assignee)
        if (request.AssigneeUserId.HasValue)
        {
            var newAssigneeId = request.AssigneeUserId.Value;

            // Nếu thực sự có thay đổi người được giao (người mới khác người cũ)
            if (task.AssigneeUserId != newAssigneeId)
            {
                task.AssigneeUserId = newAssigneeId;
                task.AssignedAt = DateTime.UtcNow;

                // Kích hoạt Domain Event cho việc gán Task
                task.AddDomainEvent(new TaskAssignedEvent(task.Id, currentUserId, newAssigneeId));
            }
        }

        task.UpdatedAt = DateTime.UtcNow;
        
        // SaveChangesAsync sẽ tự động lưu thông tin task và phát sóng Event đi
        await _dbContext.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
