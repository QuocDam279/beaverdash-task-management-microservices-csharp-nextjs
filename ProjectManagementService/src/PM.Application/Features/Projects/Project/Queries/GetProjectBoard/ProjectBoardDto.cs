using System;
using System.Collections.Generic;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public class ProjectBoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<BoardColumnDto> BoardColumns { get; set; } = new();
    public Guid? ActiveSprintId { get; set; }
    public string? ActiveSprintName { get; set; }
    public DateTime? ActiveSprintEndDate { get; set; }
    public List<SprintLookupDto> Sprints { get; set; } = new();
}

public class SprintLookupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Status { get; set; } = null!;
}
