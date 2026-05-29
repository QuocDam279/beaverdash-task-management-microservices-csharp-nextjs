using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Queries.ProjectDocuments;

public record GetProjectDocumentsQuery(Guid ProjectId) : IRequest<List<ProjectDocumentDto>>;

public class ProjectDocumentDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string FileName { get; set; } = null!;
    public string FileUrl { get; set; } = null!;
    public string? FileType { get; set; }
    public long? FileSizeBytes { get; set; }
    public Guid UploadedByUserId { get; set; }
    public string UploadedByUserName { get; set; } = null!;
    public string? UploadedByUserAvatar { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GetProjectDocumentsQueryHandler : IRequestHandler<GetProjectDocumentsQuery, List<ProjectDocumentDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetProjectDocumentsQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ProjectDocumentDto>> Handle(GetProjectDocumentsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId;

        // 1. Kiểm tra Project tồn tại
        var project = await _dbContext.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        // 2. Kiểm tra quyền truy cập (nếu không phải là Public view)
        if (!project.IsPublic)
        {
            if (currentUserId == null)
                throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

            if (project.TeamId.HasValue)
            {
                var isMember = await _dbContext.TeamMembers
                    .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
                if (!isMember)
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập dự án này.");
            }
            else if (project.CreatedByUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập dự án này.");
            }
        }

        // 3. Lấy danh sách tài liệu
        var docs = await _dbContext.ProjectDocuments
            .AsNoTracking()
            .Where(pd => pd.ProjectId == request.ProjectId)
            .Include(pd => pd.UploadedByUser)
            .OrderByDescending(pd => pd.CreatedAt)
            .Select(pd => new ProjectDocumentDto
            {
                Id = pd.Id,
                ProjectId = pd.ProjectId,
                FileName = pd.FileName,
                FileUrl = pd.FileUrl,
                FileType = pd.FileType,
                FileSizeBytes = pd.FileSizeBytes,
                UploadedByUserId = pd.UploadedByUserId,
                UploadedByUserName = pd.UploadedByUser != null ? pd.UploadedByUser.DisplayName : "Thành viên",
                UploadedByUserAvatar = pd.UploadedByUser != null ? pd.UploadedByUser.Avatar : null,
                CreatedAt = pd.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return docs;
    }
}
