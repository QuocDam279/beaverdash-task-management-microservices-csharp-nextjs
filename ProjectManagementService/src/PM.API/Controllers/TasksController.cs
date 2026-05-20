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
            NewSortOrder = request.NewSortOrder
        };
        
        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateTaskDetails(Guid id, [FromBody] UpdateTaskDetailsDto request)
    {
        var command = new UpdateTaskDetailsCommand
        {
            TaskId = id,
            AssigneeUserId = request.AssigneeUserId,
            DueDate = request.DueDate,
            StartDate = request.StartDate,
            Priority = request.Priority
        };

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Task không tồn tại." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(Guid id)
    {
        var command = new DeleteTaskCommand { TaskId = id };
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Task không tồn tại." });

        return NoContent();
    }
}
