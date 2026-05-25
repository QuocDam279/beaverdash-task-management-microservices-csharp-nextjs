using System;
using System.Collections.Generic;

namespace PM.Application.Features.Projects.Project.Queries.GetProjectBoard;

public class BoardColumnDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public int Position { get; set; }
    public int? WipLimit { get; set; }
    public bool IsDone { get; set; }
    public List<TaskItemDto> TaskItems { get; set; } = new();
}
