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
    private readonly IPMDbContext _dbContext;

    public UpdateTaskDetailsCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(UpdateTaskDetailsCommand request, CancellationToken cancellationToken)
    {
        var task = await _dbContext.TaskItems
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null)
            return false;

        // Chỉ cập nhật những trường có truyền dữ liệu lên
        if (request.DueDate.HasValue)
            task.DueDate = request.DueDate.Value;

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
                task.AddDomainEvent(new TaskAssignedEvent(task.Id, request.RequestingUserId, newAssigneeId));
            }
        }

        task.UpdatedAt = DateTime.UtcNow;
        
        // SaveChangesAsync sẽ tự động lưu thông tin task và phát sóng Event đi
        await _dbContext.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
