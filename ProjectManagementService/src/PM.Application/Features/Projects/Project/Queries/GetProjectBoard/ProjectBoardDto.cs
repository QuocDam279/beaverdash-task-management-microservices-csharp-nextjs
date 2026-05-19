using System;
using System.Collections.Generic;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public class ProjectBoardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public List<BoardColumnDto> BoardColumns { get; set; } = new();
}
