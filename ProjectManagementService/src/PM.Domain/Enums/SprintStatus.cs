namespace PM.Domain.Enums;

public enum SprintStatus
{
    Future,   // Sprint được lên kế hoạch, chưa bắt đầu
    Active,   // Sprint đang chạy (chỉ cho phép 1 Sprint Active/project)
    Closed    // Sprint đã kết thúc
}
