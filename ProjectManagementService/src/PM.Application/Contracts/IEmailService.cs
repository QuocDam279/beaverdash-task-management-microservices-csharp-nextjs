using System.Threading.Tasks;

namespace PM.Application.Contracts;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true);
}
