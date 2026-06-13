using MediatR;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Chats.Commands;

public class ChatFileDto
{
    public string FileUrl { get; set; } = null!;
    public string FileName { get; set; } = null!;
    public string FileType { get; set; } = null!;
    public long FileSize { get; set; }
}

public class UploadChatFileCommand : IRequest<ChatFileDto>
{
    public Guid RoomId { get; set; }
    public string RoomType { get; set; } = null!; // "project" or "team"
    public IFormFile File { get; set; } = null!;
}

public class UploadChatFileCommandHandler : IRequestHandler<UploadChatFileCommand, ChatFileDto>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;
    private readonly IWebHostEnvironment _env;

    public UploadChatFileCommandHandler(IPMDbContext dbContext, ICurrentUserService currentUserService, IWebHostEnvironment env)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
        _env = env;
    }

    public async Task<ChatFileDto> Handle(UploadChatFileCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Verify access to Project or Team
        if (request.RoomType.Equals("project", StringComparison.OrdinalIgnoreCase))
        {
            var project = await _dbContext.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.RoomId, cancellationToken);

            if (project == null)
                throw new KeyNotFoundException("Dự án không tồn tại.");

            if (project.CreatedByUserId != currentUserId)
            {
                if (project.TeamId.HasValue)
                {
                    var isMember = await _dbContext.TeamMembers
                        .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
                    if (!isMember)
                        throw new UnauthorizedAccessException("Bạn không có quyền gửi tệp vào dự án này.");
                }
                else if (!project.IsPublic)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền gửi tệp vào dự án này.");
                }
            }
        }
        else if (request.RoomType.Equals("team", StringComparison.OrdinalIgnoreCase))
        {
            var team = await _dbContext.Teams
                .AsNoTracking()
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == request.RoomId, cancellationToken);

            if (team == null)
                throw new KeyNotFoundException("Nhóm làm việc không tồn tại.");

            bool isMember = team.OwnerUserId == currentUserId || team.Members.Any(m => m.UserId == currentUserId);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền gửi tệp vào nhóm này.");
        }
        else
        {
            throw new ArgumentException("Loại phòng không hợp lệ.");
        }

        if (request.File == null || request.File.Length == 0)
            throw new ArgumentException("Tệp tải lên không hợp lệ.");

        // Limit maximum 10MB for chat uploads
        if (request.File.Length > 10 * 1024 * 1024)
            throw new ArgumentException("Kích thước tệp vượt quá giới hạn cho phép (tối đa 10MB).");

        // 2. Save physical file
        string webRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        string uploadsFolder = Path.Combine(webRootPath, "uploads", "chat-attachments");

        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        string uniqueFileName = $"{Guid.CreateVersion7()}_{Path.GetFileName(request.File.FileName)}";
        string filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var fileStream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(fileStream, cancellationToken);
        }

        var relativeUrl = $"/uploads/chat-attachments/{uniqueFileName}";

        return new ChatFileDto
        {
            FileUrl = relativeUrl,
            FileName = request.File.FileName,
            FileType = request.File.ContentType,
            FileSize = request.File.Length
        };
    }
}
