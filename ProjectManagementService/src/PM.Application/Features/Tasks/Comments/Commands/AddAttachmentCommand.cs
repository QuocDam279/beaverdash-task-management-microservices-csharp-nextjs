using MediatR;
using Microsoft.AspNetCore.Http;
using System;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class AddAttachmentCommand : IRequest<Guid>
{
    public Guid SubTaskId { get; set; }
    public Guid CommentId { get; set; }
    public IFormFile File { get; set; } = null!;
}
