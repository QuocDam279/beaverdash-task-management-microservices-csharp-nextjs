using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands;

public class UpdateProjectCommandHandler : IRequestHandler<UpdateProjectCommand, UpdateProjectResult>
{
    private readonly PM.Application.Contracts.IPMDbContext _dbContext;
    private readonly PM.Application.Contracts.ICurrentUserService _currentUserService;

    public UpdateProjectCommandHandler(
        PM.Application.Contracts.IPMDbContext dbContext,
        PM.Application.Contracts.ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<UpdateProjectResult> Handle(UpdateProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            return new UpdateProjectResult { Success = false };

        // Authorization check
        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Dự án không hợp lệ.");
        }

        var requestingMember = await _dbContext.TeamMembers
            .FirstOrDefaultAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);

        if (requestingMember == null || requestingMember.Role != "leader")
        {
            throw new UnauthorizedAccessException("Chỉ có trưởng nhóm mới có quyền sửa thông tin dự án này.");
        }

        // Capture old project properties for logging
        string oldName = project.Name;
        string? oldDescription = project.Description;
        bool oldIsPublic = project.IsPublic;

        // Apply changes
        if (request.Name != null)
        {
            if (!project.TeamId.HasValue)
            {
                throw new InvalidOperationException("Dự án không hợp lệ.");
            }

            var isDuplicate = await _dbContext.Projects.AnyAsync(p => p.Id != project.Id && p.TeamId == project.TeamId.Value && p.Name.ToLower() == request.Name.ToLower(), cancellationToken);
            if (isDuplicate)
            {
                throw new InvalidOperationException("Tên dự án đã tồn tại trong nhóm này. Vui lòng chọn tên khác.");
            }
            project.Name = request.Name;
        }
        
        if (request.Description != null)
            project.Description = request.Description;

        // Validate proposed dates
        var proposedStartDate = request.StartDate.HasValue 
            ? (request.StartDate.Value == DateTime.MinValue ? null : (DateTime?)request.StartDate.Value) 
            : project.StartDate;

        var proposedDueDate = request.DueDate.HasValue 
            ? (request.DueDate.Value == DateTime.MinValue ? null : (DateTime?)request.DueDate.Value) 
            : project.DueDate;

        if (proposedStartDate.HasValue && proposedDueDate.HasValue && proposedStartDate.Value > proposedDueDate.Value)
        {
            throw new InvalidOperationException("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
        }

        if (request.Progress.HasValue)
            project.Progress = request.Progress.Value;

        if (request.StartDate.HasValue)
        {
            project.StartDate = proposedStartDate;
        }

        if (request.DueDate.HasValue)
        {
            project.DueDate = proposedDueDate;
        }

        if (request.IsPublic.HasValue)
        {
            project.IsPublic = request.IsPublic.Value;
            if (project.IsPublic)
            {
                if (string.IsNullOrEmpty(project.ShareToken))
                {
                    project.ShareToken = Guid.CreateVersion7().ToString("N");
                }
            }
            else
            {
                project.ShareToken = null;
            }
        }

        // Track changes
        var changedFields = new System.Collections.Generic.List<PM.Domain.Common.FieldChange>();

        if (request.Name != null && project.Name != oldName)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("Name", oldName, project.Name));
        }

        if (request.Description != null && project.Description != oldDescription)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("Description", oldDescription, project.Description));
        }

        if (request.IsPublic.HasValue && project.IsPublic != oldIsPublic)
        {
            changedFields.Add(new PM.Domain.Common.FieldChange("IsPublic", oldIsPublic.ToString(), project.IsPublic.ToString()));
        }

        if (changedFields.Count > 0)
        {
            project.AddDomainEvent(new PM.Domain.Events.ProjectUpdatedEvent(
                project.Id,
                project.Name,
                project.Description,
                currentUserId,
                changedFields
            ));
        }

        project.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new UpdateProjectResult
        {
            Success = true,
            ShareToken = project.ShareToken,
            IsPublic = project.IsPublic
        };
    }
}
