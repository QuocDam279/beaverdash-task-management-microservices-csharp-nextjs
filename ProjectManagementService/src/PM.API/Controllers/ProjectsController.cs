using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Projects.Project.Commands;
using PM.Application.Features.Projects.Project.Queries;
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

    [HttpGet]
    public async Task<IActionResult> GetMyProjects()
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetMyProjects.GetMyProjectsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectCommand command)

    {
        var projectId = await _mediator.Send(command);
        return StatusCode(201, new { Id = projectId });
    }

    [HttpGet("{id}/board")]
    public async Task<IActionResult> GetProjectBoard(Guid id, [FromQuery] Guid? sprintId = null)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectBoard.GetProjectBoardQuery(id, sprintId);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Project not found." });

        return Ok(result);
    }

    [HttpGet("{id}/activities")]
    public async Task<IActionResult> GetProjectActivities(
        Guid id, 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 50,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? date = null)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectActivities.GetProjectActivitiesQuery(id, page, pageSize, userId, date);
        var result = await _mediator.Send(query);
        return Ok(result);
    }


    [HttpGet("{id}/overview")]
    public async Task<IActionResult> GetProjectOverview(Guid id)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectOverview.GetProjectOverviewQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return Ok(result);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto request)
    {
        var command = new UpdateProjectCommand
        {
            ProjectId = id,
            Name = request.Name,
            Description = request.Description,
            Progress = request.Progress,
            StartDate = request.StartDate,
            DueDate = request.DueDate,
            IsPublic = request.IsPublic
        };

        var result = await _mediator.Send(command);

        if (!result.Success)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var command = new DeleteProjectCommand { ProjectId = id };
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return NoContent();
    }

    [HttpPost("{id}/documents")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadDocument(Guid id, [FromForm] Microsoft.AspNetCore.Http.IFormFile file)
    {
        var command = new PM.Application.Features.Projects.Project.Commands.ProjectDocuments.UploadProjectDocumentCommand
        {
            ProjectId = id,
            File = file
        };
        var documentId = await _mediator.Send(command);
        return StatusCode(201, new { Id = documentId });
    }

    [HttpGet("{id}/documents")]
    public async Task<IActionResult> GetProjectDocuments(Guid id)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.ProjectDocuments.GetProjectDocumentsQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpDelete("{id}/documents/{documentId}")]
    public async Task<IActionResult> DeleteDocument(Guid id, Guid documentId)
    {
        var command = new PM.Application.Features.Projects.Project.Commands.ProjectDocuments.DeleteProjectDocumentCommand(id, documentId);
        var result = await _mediator.Send(command);
        if (!result)
            return NotFound(new { Message = "Tài liệu không tồn tại." });
        return NoContent();
    }

    [HttpGet("shared-with-me")]
    public async Task<IActionResult> GetProjectsSharedWithMe()
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectsSharedWithMeQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/share")]
    public async Task<IActionResult> ShareProject(Guid id, [FromBody] ShareProjectDto request)
    {
        if (string.IsNullOrWhiteSpace(request?.Email))
            return BadRequest(new { Message = "Email không hợp lệ." });

        var command = new ShareProjectCommand(id, request.Email);
        var result = await _mediator.Send(command);
        return Ok(new { Success = result });
    }

    [HttpDelete("{id}/share")]
    public async Task<IActionResult> RevokeProjectShare(Guid id, [FromQuery] string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return BadRequest(new { Message = "Email không hợp lệ." });

        var command = new RevokeProjectShareCommand(id, email);
        var result = await _mediator.Send(command);
        if (!result)
            return NotFound(new { Message = "Không tìm thấy thông tin chia sẻ cho email này." });

        return Ok(new { Success = result });
    }

    [HttpGet("{id}/shares")]
    public async Task<IActionResult> GetProjectShares(Guid id)
    {
        var query = new GetProjectSharesQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/chat")]
    public async Task<IActionResult> GetProjectChatHistory(Guid id, [FromQuery] int limit = 100)
    {
        var query = new PM.Application.Features.Chats.Queries.GetChatMessagesQuery(ProjectId: id, TeamId: null, Limit: limit);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost("{id}/chat/upload")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadProjectChatFile(Guid id, [FromForm] Microsoft.AspNetCore.Http.IFormFile file)
    {
        var command = new PM.Application.Features.Chats.Commands.UploadChatFileCommand
        {
            RoomId = id,
            RoomType = "project",
            File = file
        };
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}

public class ShareProjectDto
{
    public string Email { get; set; } = null!;
}

