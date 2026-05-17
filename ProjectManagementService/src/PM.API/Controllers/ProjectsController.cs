using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Projects.Project.Commands;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectCommand command)
    {
        var projectId = await _mediator.Send(command);
        return StatusCode(201, new { Id = projectId });
    }
}
