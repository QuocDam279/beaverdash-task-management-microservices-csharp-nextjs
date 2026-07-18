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
    private readonly IFileStorageService _storageService;

    public UploadProjectDocumentCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService, IFileStorageService storageService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _storageService = storageService;
    }

    public async Task<Guid> Handle(UploadProjectDocumentCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Kiểm tra Project tồn tại
        var project = await _dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        if (project == null)
            throw new KeyNotFoundException("Dự án không tồn tại.");

        if (!project.TeamId.HasValue)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền upload tài liệu cho dự án này.");
        }

        var isMember = await _dbContext.TeamMembers
            .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
        if (!isMember)
            throw new UnauthorizedAccessException("Bạn không có quyền upload tài liệu cho dự án này.");

        if (request.File == null || request.File.Length == 0)
            throw new ArgumentException("Tệp tải lên không hợp lệ hoặc bị trống.");

        // Giới hạn tối đa 100MB (100 * 1024 * 1024 bytes)
        if (request.File.Length > 100 * 1024 * 1024)
            throw new ArgumentException("Kích thước tệp vượt quá giới hạn cho phép (tối đa 100MB).");

        // 3. Xử lý lưu tệp lên Cloud Storage
        string fileUrl = await _storageService.UploadFileAsync(request.File, "project-documents", cancellationToken);

        // 4. Lưu metadata vào Database
        var document = new ProjectDocument
        {
            Id = Guid.CreateVersion7(),
            ProjectId = request.ProjectId,
            FileName = request.File.FileName,
            FileUrl = fileUrl,
            FileType = request.File.ContentType,
            FileSizeBytes = request.File.Length,
            UploadedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ProjectDocuments.Add(document);

        document.AddDomainEvent(new PM.Domain.Events.ProjectDocumentUploadedEvent(
            request.ProjectId,
            document.Id,
            document.FileName,
            currentUserId
        ));

        await _dbContext.SaveChangesAsync(cancellationToken);

        return document.Id;
    }
}
