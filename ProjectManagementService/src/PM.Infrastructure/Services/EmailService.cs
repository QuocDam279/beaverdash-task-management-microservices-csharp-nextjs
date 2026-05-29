using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using PM.Application.Contracts;

namespace PM.Infrastructure.Services;

public class EmailService : IEmailService
{
    public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
    {
        var smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        var smtpPort = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT"), out var port) ? port : 587;
        var smtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? "";
        var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
        var senderName = Environment.GetEnvironmentVariable("SMTP_SENDER_NAME") ?? "Beaverdash";
        var senderEmail = Environment.GetEnvironmentVariable("SMTP_SENDER_EMAIL") ?? smtpUser;

        if (string.IsNullOrWhiteSpace(smtpUser) || string.IsNullOrWhiteSpace(smtpPassword))
        {
            Console.WriteLine("[EmailService] SMTP credentials are not configured. Skipping email send.");
            return;
        }

        using var smtpClient = new SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new NetworkCredential(smtpUser, smtpPassword),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(senderEmail, senderName),
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };
        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}
