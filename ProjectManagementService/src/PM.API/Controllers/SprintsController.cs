using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Sprints.Commands;
using PM.Application.Features.Sprints.Queries.GetBacklog;
using PM.Application.Features.Sprints.Queries.GetSprintById;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SprintsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SprintsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSprint([FromBody] CreateSprintCommand command)
    {
        var sprintId = await _mediator.Send(command);
        return StatusCode(201, new { Id = sprintId });
    }

    [HttpGet("/api/projects/{projectId}/backlog")]
    public async Task<IActionResult> GetBacklog(Guid projectId)
    {
        var query = new GetBacklogQuery(projectId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSprintById(Guid id)
    {
        var query = new GetSprintByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Sprint không tồn tại." });

        return Ok(result);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateSprint(Guid id, [FromBody] UpdateSprintDto request)
    {
        var command = new UpdateSprintCommand(id, request.Name, request.Goal, request.StartDate, request.EndDate);
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Sprint không tồn tại hoặc không ở trạng thái Future." });

        return NoContent();
    }

    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartSprint(Guid id)
    {
        var command = new StartSprintCommand(id);
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Sprint không tồn tại." });

        return Ok(new { Message = "Sprint đã bắt đầu thành công." });
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> CloseSprint(Guid id, [FromBody] CloseSprintRequestDto request)
    {
        if (!Enum.TryParse<UncompletedTaskAction>(request.Action, true, out var action))
        {
            return BadRequest(new { Message = "Hành động cho công việc chưa hoàn thành không hợp lệ." });
        }

        var command = new CloseSprintCommand(id, action, request.MoveToSprintId);
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Sprint không tồn tại." });

        return Ok(new { Message = "Sprint đã được đóng thành công." });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSprint(Guid id)
    {
        var command = new DeleteSprintCommand(id);
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Sprint không tồn tại hoặc không thể xóa (chỉ xóa khi ở trạng thái Future)." });

        return NoContent();
    }

    [HttpPost("move-tasks")]
    public async Task<IActionResult> MoveTasksToSprint([FromBody] MoveTasksToSprintDto request)
    {
        var command = new MoveTaskToSprintCommand(request.TaskIds, request.SprintId, request.ProjectId);
        await _mediator.Send(command);
        return NoContent();
    }
}

public class UpdateSprintDto
{
    public string Name { get; set; } = null!;
    public string? Goal { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class CloseSprintRequestDto
{
    public string Action { get; set; } = null!; // "MoveToBacklog" or "MoveToNextSprint"
    public Guid? MoveToSprintId { get; set; }
}

public class MoveTasksToSprintDto
{
    public List<Guid> TaskIds { get; set; } = new();
    public Guid? SprintId { get; set; }
    public Guid ProjectId { get; set; }
}
