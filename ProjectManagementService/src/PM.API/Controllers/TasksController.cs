using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Tasks.TaskItem.Commands;
using PM.Application.Features.Tasks.TaskItem.Queries;
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

    [HttpGet]
    public async Task<IActionResult> GetMyTasks()
    {
        var query = new GetMyTasksQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
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
            Title = request.Title,
            Description = request.Description,
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

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTaskDetails(Guid id)
    {
        var query = new GetTaskDetailsQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Công việc không tồn tại." });

        return Ok(result);
    }

    [HttpGet("trash")]
    public async Task<IActionResult> GetTrashTasks()
    {
        var query = new GetTrashTasksQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("batch-restore")]
    public async Task<IActionResult> BatchRestore([FromBody] BatchTaskActionDto request)
    {
        foreach (var id in request.TaskIds)
        {
            var command = new RestoreTaskCommand { TaskId = id };
            await _mediator.Send(command);
        }
        return Ok(new { Message = "Đã khôi phục các công việc thành công." });
    }

    [HttpPost("batch-permanent-delete")]
    public async Task<IActionResult> BatchPermanentDelete([FromBody] BatchTaskActionDto request)
    {
        foreach (var id in request.TaskIds)
        {
            var command = new PermanentDeleteTaskCommand { TaskId = id };
            await _mediator.Send(command);
        }
        return NoContent();
    }

    [HttpPost("empty-trash")]
    public async Task<IActionResult> EmptyTrash()
    {
        var query = new GetTrashTasksQuery();
        var trashTasks = await _mediator.Send(query);
        foreach (var task in trashTasks)
        {
            var command = new PermanentDeleteTaskCommand { TaskId = task.Id };
            await _mediator.Send(command);
        }
        return NoContent();
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreTask(Guid id)
    {
        var command = new RestoreTaskCommand { TaskId = id };
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Task không tồn tại trong thùng rác." });

        return Ok(new { Message = "Đã khôi phục công việc thành công." });
    }

    [HttpDelete("{id}/permanent")]
    public async Task<IActionResult> PermanentDeleteTask(Guid id)
    {
        var command = new PermanentDeleteTaskCommand { TaskId = id };
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Task không tồn tại trong thùng rác." });

        return NoContent();
    }
}

public class BatchTaskActionDto
{
    public System.Collections.Generic.List<Guid> TaskIds { get; set; } = new();
}
