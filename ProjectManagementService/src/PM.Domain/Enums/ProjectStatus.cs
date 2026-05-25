namespace PM.Domain.Enums;

public enum ProjectStatus
{
    NotStarted,  // Chưa bắt đầu
    InProgress,  // Đang thực hiện
    Paused,      // Tạm dừng
    Completed    // Đã hoàn thành
}

public static class ProjectStatusExtensions
{
    public static string ToVietnameseString(this ProjectStatus status)
    {
        return status switch
        {
            ProjectStatus.NotStarted => "Chưa bắt đầu",
            ProjectStatus.InProgress => "Đang thực hiện",
            ProjectStatus.Paused => "Tạm dừng",
            ProjectStatus.Completed => "Đã hoàn thành",
            _ => "Chưa bắt đầu"
        };
    }
}
