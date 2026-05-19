using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Tasks.TaskItem.Commands;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly IMediator _mediator;

    public TasksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] CreateTaskCommand command)
    {
        var taskId = await _mediator.Send(command);
        
        return StatusCode(201, new { Id = taskId });
    }

    [HttpPut("{id}/move")]
    public async Task<IActionResult> MoveTask(Guid id, [FromBody] MoveTaskDto request)
    {
        var command = new MoveTaskCommand 
        { 
            TaskId = id, 
            NewBoardColumnId = request.NewBoardColumnId, 
            NewSortOrder = request.NewSortOrder,
            RequestingUserId = request.RequestingUserId
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPost("{taskId}/comments")]
    public async Task<IActionResult> AddComment(Guid taskId, [FromBody] PM.Application.Features.Tasks.Comments.Commands.AddCommentDto request)
    {
        var command = new PM.Application.Features.Tasks.Comments.Commands.AddCommentCommand
        {
            TaskId = taskId,
            Content = request.Content,
            UserId = request.RequestingUserId // Giả lập auth
        };

        var commentId = await _mediator.Send(command);
        return StatusCode(201, new { Id = commentId });
    }

    [HttpGet("{taskId}/comments")]
    public async Task<IActionResult> GetTaskComments(Guid taskId)
    {
        var query = new PM.Application.Features.Tasks.Comments.Queries.GetTaskCommentsQuery(taskId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpDelete("{taskId}/comments/{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid taskId, Guid commentId, [FromBody] PM.Application.Features.Tasks.Comments.Commands.DeleteCommentDto request)
    {
        var command = new PM.Application.Features.Tasks.Comments.Commands.DeleteCommentCommand
        {
            TaskId = taskId,
            CommentId = commentId,
            RequestingUserId = request.RequestingUserId
        };

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Bình luận không tồn tại." });

        return NoContent();
    }

    [HttpPost("{taskId}/comments/{commentId}/attachments")]
    public async Task<IActionResult> AddAttachment(Guid taskId, Guid commentId, [FromForm] Microsoft.AspNetCore.Http.IFormFile file, [FromForm] Guid requestingUserId)
    {
        var command = new PM.Application.Features.Tasks.Comments.Commands.AddAttachmentCommand
        {
            TaskId = taskId,
            CommentId = commentId,
            File = file,
            RequestingUserId = requestingUserId // Giả lập auth
        };

        var attachmentId = await _mediator.Send(command);
        return StatusCode(201, new { Id = attachmentId });
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateTaskDetails(Guid id, [FromBody] PM.Application.Features.Tasks.TaskItem.Commands.UpdateTaskDetailsDto request)
    {
        var command = new PM.Application.Features.Tasks.TaskItem.Commands.UpdateTaskDetailsCommand
        {
            TaskId = id,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            StartDate = request.StartDate,
            Priority = request.Priority,
            RequestingUserId = request.RequestingUserId
        };

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Task không tồn tại." });

        return NoContent();
    }
}
