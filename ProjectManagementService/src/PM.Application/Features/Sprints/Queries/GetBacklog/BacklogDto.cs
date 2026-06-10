using System.Collections.Generic;

namespace PM.Application.Features.Sprints.Queries.GetBacklog;

public class BacklogDto
{
    public List<SprintDto> Sprints { get; set; } = new();
    public List<BacklogTaskDto> BacklogTasks { get; set; } = new();
}
