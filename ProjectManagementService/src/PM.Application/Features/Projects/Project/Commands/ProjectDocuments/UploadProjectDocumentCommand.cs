using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Projects.Project.Commands.ProjectDocuments;

public class UploadProjectDocumentCommand : IRequest<Guid>
{
    public Guid ProjectId { get; set; }
    public IFormFile File { get; set; } = null!;
}

public class UploadProjectDocumentCommandHandler : IRequestHandler<UploadProjectDocumentCommand, Guid>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWebHostEnvironment _env;

    public UploadProjectDocumentCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _env = env;
    }

    public async Task<Guid> Handle(UploadProjectDocumentCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Kiểm tra Project tồn tại
        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        // 2. Kiểm tra quyền của User
        if (project.TeamId.HasValue)
        {
            var isMember = await _dbContext.TeamMembers
                .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền upload tài liệu cho dự án này.");
        }
        else if (project.CreatedByUserId != currentUserId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền upload tài liệu cho dự án này.");
        }

        if (request.File == null || request.File.Length == 0)
            throw new ArgumentException("Tệp tải lên không hợp lệ hoặc bị trống.");

        // Giới hạn tối đa 50MB (50 * 1024 * 1024 bytes)
        if (request.File.Length > 50 * 1024 * 1024)
            throw new ArgumentException("Kích thước tệp vượt quá giới hạn cho phép (tối đa 50MB).");

        // 3. Xử lý lưu tệp vật lý
        string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string uploadsFolder = Path.Combine(webRootPath, "uploads", "project-documents");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        string uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(request.File.FileName)}";
        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(fileStream, cancellationToken);
        }

        // 4. Lưu metadata vào Database
        var relativeUrl = $"/uploads/project-documents/{uniqueFileName}";

        var document = new ProjectDocument
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            FileName = request.File.FileName,
            FileUrl = relativeUrl,
            FileType = request.File.ContentType,
            FileSizeBytes = request.File.Length,
            UploadedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ProjectDocuments.Add(document);

        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            UserId = currentUserId,
            EntityType = "ProjectDocument",
            EntityId = document.Id,
            ActionType = "Upload",
            OldValue = null,
            NewValue = System.Text.Json.JsonSerializer.Serialize(document.FileName),
            CreatedAt = DateTime.UtcNow
        };
        _dbContext.ActivityLogs.Add(log);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return document.Id;
    }
}
