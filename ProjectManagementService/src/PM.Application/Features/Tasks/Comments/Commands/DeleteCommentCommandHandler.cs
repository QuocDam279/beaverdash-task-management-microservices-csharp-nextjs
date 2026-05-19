using MediatR;
using Microsoft.EntityFrameworkCore;
using PM.Application.Contracts;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PM.Application.Features.Tasks.Comments.Commands;

public class DeleteCommentCommandHandler : IRequestHandler<DeleteCommentCommand, bool>
{
    private readonly IPMDbContext _dbContext;

    public DeleteCommentCommandHandler(IPMDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> Handle(DeleteCommentCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra bình luận có tồn tại và thuộc về task không
        var comment = await _dbContext.Comments
            .FirstOrDefaultAsync(c => c.Id == request.CommentId && c.TaskId == request.TaskId, cancellationToken);

        // Trả về false để Controller báo lỗi 404
        if (comment == null)
            return false;

        // 2. Kiểm tra quyền (Authorization): Chỉ người tạo mới được xóa
        if (comment.UserId != request.RequestingUserId)
            throw new UnauthorizedAccessException("Forbidden: Bạn không có quyền xóa bình luận của người khác.");

        // 3. Thực thi xóa
        _dbContext.Comments.Remove(comment);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
