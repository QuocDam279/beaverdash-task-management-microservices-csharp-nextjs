using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using PM.Domain.Entities;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class AddAttachmentCommandHandler : IRequestHandler<AddAttachmentCommand, Guid>
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IPMDbContext _dbContext;
    private readonly IFileStorageService _storageService;

    public AddAttachmentCommandHandler(IPMDbContext dbContext, IFileStorageService storageService, ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
        _dbContext = dbContext;
        _storageService = storageService;
    }

    public async Task<Guid> Handle(AddAttachmentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Comment tồn tại
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.SubTaskId == request.SubTaskId, cancellationToken);

        if (comment == null)
            throw new InvalidOperationException("Bình luận không tồn tại hoặc không thuộc về SubTask này.");

        // 2. Validate Authorization: Chỉ chủ nhân bình luận mới được đính kèm
        if (comment.UserId != (_currentUserService.UserId ?? throw new System.UnauthorizedAccessException()))
            throw new UnauthorizedAccessException("Bạn không có quyền đính kèm file vào bình luận của người khác.");

        if (request.File == null || request.File.Length == 0)
            throw new ArgumentException("File đính kèm không hợp lệ hoặc bị trống.");

        // 3. Xử lý lưu file lên Cloud Storage
        string fileUrl = await _storageService.UploadFileAsync(request.File, "attachments", cancellationToken);

        // 4. Lưu thông tin metadata vào Database
        var attachment = new Attachment
        {
            Id = Guid.CreateVersion7(),
            CommentId = request.CommentId,
            FileName = request.File.FileName,
            FileUrl = fileUrl,
            FileType = request.File.ContentType,
            FileSizeBytes = request.File.Length,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Attachments.Add(attachment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return attachment.Id;
    }
}
