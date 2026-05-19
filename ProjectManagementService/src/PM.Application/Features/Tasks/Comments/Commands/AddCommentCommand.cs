using MediatR;
using System;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class AddCommentDto
{
    public string Content { get; set; } = null!;
    
    // Giả lập UserId từ token
    public Guid RequestingUserId { get; set; }
}

public class AddCommentCommand : IRequest<Guid>
{
    public Guid TaskId { get; set; }
    public string Content { get; set; } = null!;
    public Guid UserId { get; set; }
}
