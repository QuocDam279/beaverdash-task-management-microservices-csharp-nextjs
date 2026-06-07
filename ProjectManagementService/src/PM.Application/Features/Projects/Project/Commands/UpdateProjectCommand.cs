using MediatR;
using System;

namespace PM.Application.Features.Projects.Project.Commands;

public class UpdateProjectResult
{
    public bool Success { get; set; }
    public string? ShareToken { get; set; }
    public bool? IsPublic { get; set; }
}

public class UpdateProjectCommand : IRequest<UpdateProjectResult>
{
    public Guid ProjectId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public bool? IsPublic { get; set; }
}

public class UpdateProjectDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public int? Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public bool? IsPublic { get; set; }
}
