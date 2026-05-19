using MediatR;
using System;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class DeleteCommentDto
{
    // Giả lập ID của người đang thực hiện request (trong thực tế sẽ lấy từ Token)
    public Guid RequestingUserId { get; set; }
}

public class DeleteCommentCommand : IRequest<bool>
{
    public Guid TaskId { get; set; }
    public Guid CommentId { get; set; }
    public Guid RequestingUserId { get; set; }
}
