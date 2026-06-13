using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Chats.Queries;

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderDisplayName { get; set; } = null!;
    public string? SenderAvatar { get; set; }
    public string SenderEmail { get; set; } = null!;
    public string Content { get; set; } = null!;
    public string? FileUrl { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }
    public long? FileSize { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? ProjectId { get; set; }
    public Guid? TeamId { get; set; }
}

public record GetChatMessagesQuery(Guid? ProjectId, Guid? TeamId, int Limit = 100) : IRequest<List<ChatMessageDto>>;

public class GetChatMessagesQueryHandler : IRequestHandler<GetChatMessagesQuery, List<ChatMessageDto>>
{
    private readonly IPMDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public GetChatMessagesQueryHandler(IPMDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public async Task<List<ChatMessageDto>> Handle(GetChatMessagesQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = _currentUserService.UserId ?? throw new UnauthorizedAccessException("Bạn chưa đăng nhập.");

        // 1. Authorization checks
        if (request.ProjectId.HasValue)
        {
            var project = await _dbContext.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == request.ProjectId.Value, cancellationToken);

            if (project == null)
                throw new KeyNotFoundException("Dự án không tồn tại.");

            if (project.CreatedByUserId != currentUserId)
            {
                if (project.TeamId.HasValue)
                {
                    var isMember = await _dbContext.TeamMembers
                        .AnyAsync(tm => tm.TeamId == project.TeamId.Value && tm.UserId == currentUserId, cancellationToken);
                    if (!isMember)
                        throw new UnauthorizedAccessException("Bạn không có quyền truy cập cuộc trò chuyện của dự án này.");
                }
                else if (!project.IsPublic)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập cuộc trò chuyện của dự án này.");
                }
            }
        }
        else if (request.TeamId.HasValue)
        {
            var team = await _dbContext.Teams
                .AsNoTracking()
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == request.TeamId.Value, cancellationToken);

            if (team == null)
                throw new KeyNotFoundException("Nhóm làm việc không tồn tại.");

            bool isMember = team.OwnerUserId == currentUserId || team.Members.Any(m => m.UserId == currentUserId);
            if (!isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập cuộc trò chuyện của nhóm này.");
        }
        else
        {
            throw new ArgumentException("Phải chỉ định ProjectId hoặc TeamId.");
        }

        // 2. Fetch history
        var query = _dbContext.ChatMessages
            .AsNoTracking()
            .Include(c => c.Sender)
            .AsQueryable();

        if (request.ProjectId.HasValue)
        {
            query = query.Where(c => c.ProjectId == request.ProjectId);
        }
        else
        {
            query = query.Where(c => c.TeamId == request.TeamId);
        }

        // Fetch latest 'Limit' messages
        var messages = await query
            .OrderByDescending(c => c.CreatedAt)
            .Take(request.Limit)
            .ToListAsync(cancellationToken);

        // Map and reverse to ascending order for presentation
        return messages
            .Select(c => new ChatMessageDto
            {
                Id = c.Id,
                SenderId = c.SenderId,
                SenderDisplayName = c.Sender?.DisplayName ?? "Thành viên cũ",
                SenderAvatar = c.Sender?.Avatar,
                SenderEmail = c.Sender?.Email ?? string.Empty,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                ProjectId = c.ProjectId,
                TeamId = c.TeamId,
                FileUrl = c.FileUrl,
                FileName = c.FileName,
                FileType = c.FileType,
                FileSize = c.FileSize
            })
            .OrderBy(dto => dto.CreatedAt)
            .ToList();
    }
}
