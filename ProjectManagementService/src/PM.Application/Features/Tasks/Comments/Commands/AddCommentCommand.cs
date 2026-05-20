using MediatR;
using System;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class AddCommentDto
{
    public string Content { get; set; } = null!;
    
    // Giả lập UserId từ token
}

public class AddCommentCommand : IRequest<Guid>
{
    public Guid SubTaskId { get; set; }
    public string Content { get; set; } = null!;
}
