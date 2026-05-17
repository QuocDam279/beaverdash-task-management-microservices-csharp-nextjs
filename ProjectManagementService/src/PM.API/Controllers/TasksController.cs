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
        
        // Usually CreatedAtAction returns a 201 with a Location header pointing to the new resource.
        // Even if GetTaskById is not implemented yet, returning a 201 status code is RESTful.
        return StatusCode(201, new { Id = taskId });
    }
}
