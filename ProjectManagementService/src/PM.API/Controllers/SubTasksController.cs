using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Tasks.SubTasks.Commands;
using PM.Application.Features.Tasks.Comments.Commands;
using PM.Application.Features.Tasks.Comments.Queries;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubTasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public SubTasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSubTask([FromBody] CreateSubTaskCommand command)
    {
        var subTaskId = await _mediator.Send(command);
        return StatusCode(201, new { Id = subTaskId });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateSubTaskDetails(Guid id, [FromBody] UpdateSubTaskDetailsDto request)
    {
        var command = new UpdateSubTaskDetailsCommand
        {
            SubTaskId = id,
            Title = request.Title,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            IsCompleted = request.IsCompleted,
            Priority = request.Priority
        };

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { Message = "SubTask không tồn tại." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubTask(Guid id)
    {
        var command = new DeleteSubTaskCommand { SubTaskId = id };
        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { Message = "SubTask không tồn tại." });

        return NoContent();
    }

    [HttpPost("{subTaskId}/comments")]
    public async Task<IActionResult> AddComment(Guid subTaskId, [FromBody] AddCommentDto request)
    {
        var command = new AddCommentCommand
        {
            SubTaskId = subTaskId,
            Content = request.Content
        };

        var commentId = await _mediator.Send(command);
        return StatusCode(201, new { Id = commentId });
    }

    [HttpGet("{subTaskId}/comments")]
    public async Task<IActionResult> GetSubTaskComments(Guid subTaskId)
    {
        var query = new GetTaskCommentsQuery(subTaskId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpDelete("{subTaskId}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid subTaskId, Guid commentId)
    {
        var command = new DeleteCommentCommand
        {
            SubTaskId = subTaskId,
            CommentId = commentId
        };

        var success = await _mediator.Send(command);
        if (!success)
            return NotFound(new { Message = "Bình luận không tồn tại." });

        return NoContent();
    }

    [HttpPost("{subTaskId}/comments/{commentId}/attachments")]
    public async Task<IActionResult> AddAttachment(Guid subTaskId, Guid commentId, [FromForm] Microsoft.AspNetCore.Http.IFormFile file)
    {
        var command = new AddAttachmentCommand
        {
            SubTaskId = subTaskId,
            CommentId = commentId,
            File = file
        };

        var attachmentId = await _mediator.Send(command);
        return StatusCode(201, new { Id = attachmentId });
    }
}
