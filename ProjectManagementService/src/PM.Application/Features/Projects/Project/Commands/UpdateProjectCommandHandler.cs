using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Enums;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, UpdateProjectResult>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;
    private readonly PM.Application.Contracts.IAIAssistantServiceClient _aiAssistantClient;

    public UpdateProjectCommandHandler(
        PM.Application.Contracts.IPMDbContext dbContext,
        PM.Application.Contracts.ICurrentUserService currentUserService,
        PM.Application.Contracts.IAIAssistantServiceClient aiAssistantClient)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _aiAssistantClient = aiAssistantClient;
    }

    public async Task<UpdateProjectResult> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return new UpdateProjectResult { Success = false };

        // Authorization check
        if (project.TeamId.HasValue)
        {
            var requestingMember = await _dbContext.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

            if (requestingMember == null || requestingMember.Role != "leader")
            {
                throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền sửa thông tin dự án này.");
            }
        }
        else
        {
            if (project.CreatedByUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền sửa thông tin dự án này.");
            }
        }

        // Capture old project properties for logging
        string oldName = project.Name;
        string? oldDescription = project.Description;

        // Apply changes
        if (request.Name != null)
        {
            if (project.TeamId.HasValue)
            {
                var isDuplicate = await _dbContext.Projects.AnyAsync(p => p.Id != project.Id && p.TeamId == project.TeamId.Value && p.Name.ToLower() == request.Name.ToLower(), cancellationToken);
                if (isDuplicate)
                {
                    throw new InvalidOperationException("Tên dự án đã tồn tại trong nhóm này. Vui lòng chọn tên khác.");
                }
            }
            else
            {
                var isDuplicate = await _dbContext.Projects.AnyAsync(p => p.Id != project.Id && p.TeamId == null && p.CreatedByUserId == currentUserId && p.Name.ToLower() == request.Name.ToLower(), cancellationToken);
                if (isDuplicate)
                {
                    throw new InvalidOperationException("Tên dự án cá nhân đã tồn tại. Vui lòng chọn tên khác.");
                }
            }
            project.Name = request.Name;
        }
        
        if (request.Description != null)
            project.Description = request.Description;

        if (request.Status.HasValue)
            project.Status = request.Status.Value;

        if (request.Progress.HasValue)
            project.Progress = request.Progress.Value;

        if (request.StartDate.HasValue)
        {
            project.StartDate = request.StartDate.Value == DateTime.MinValue ? null : request.StartDate.Value;
        }

        if (request.DueDate.HasValue)
        {
            project.DueDate = request.DueDate.Value == DateTime.MinValue ? null : request.DueDate.Value;
        }

        if (request.IsPublic.HasValue)
        {
            var oldIsPublic = project.IsPublic;
            project.IsPublic = request.IsPublic.Value;
            if (project.IsPublic)
            {
                if (string.IsNullOrEmpty(project.ShareToken))
                {
                    project.ShareToken = Guid.NewGuid().ToString("N");
                }
            }
            else
            {
                project.ShareToken = null;
            }

            if (oldIsPublic != project.IsPublic)
            {
                _dbContext.ActivityLogs.Add(new ActivityLog
                {
                    Id = Guid.NewGuid(),
                    ProjectId = project.Id,
                    UserId = currentUserId,
                    EntityType = "project",
                    EntityId = project.Id,
                    ActionType = project.IsPublic ? "public_shared" : "private_restricted",
                    NewValue = System.Text.Json.JsonSerializer.Serialize(new { isPublic = project.IsPublic }),
                    CreatedAt = DateTime.UtcNow
                });
            }
        }

        // Log project changes
        if (request.Name != null && request.Name != oldName)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "project",
                EntityId = project.Id,
                ActionType = "updated_name",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { name = request.Name, old_name = oldName }),
                CreatedAt = DateTime.UtcNow
            });
        }

        if (request.Description != null && request.Description != oldDescription)
        {
            _dbContext.ActivityLogs.Add(new ActivityLog
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                UserId = currentUserId,
                EntityType = "project",
                EntityId = project.Id,
                ActionType = "updated_description",
                NewValue = System.Text.Json.JsonSerializer.Serialize(new { name = project.Name }),
                CreatedAt = DateTime.UtcNow
            });
        }

        project.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Sync with AI Assistant Service
        try
        {
            await _aiAssistantClient.SyncProjectAsync(
                project.Id, 
                project.Name, 
                project.Description, 
                project.Status.ToVietnameseString()
            );
        }
        catch (Exception ex)
        {
            // Fail silently or log
            Console.WriteLine($"Sync with AIAssistant failed: {ex.Message}");
        }

        return new UpdateProjectResult
        {
            Success = true,
            ShareToken = project.ShareToken,
            IsPublic = project.IsPublic
        };
    }
}
