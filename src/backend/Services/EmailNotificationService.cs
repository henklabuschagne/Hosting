using System.Net;
using System.Net.Mail;

namespace HostingPlatform.API.Services
{
    public interface IEmailNotificationService
    {
        Task SendHealthAlertEmailAsync(string serverName, string alertTitle, string alertMessage, string severity, List<string> recipients);
        Task SendHealthSummaryEmailAsync(string subject, string body, List<string> recipients);
    }

    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailNotificationService> _logger;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _enableSsl;

        public EmailNotificationService(IConfiguration configuration, ILogger<EmailNotificationService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Load SMTP settings from configuration
            _smtpHost = _configuration["EmailSettings:SmtpHost"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"] ?? "";
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"] ?? "";
            _fromEmail = _configuration["EmailSettings:FromEmail"] ?? "noreply@hostingplatform.com";
            _fromName = _configuration["EmailSettings:FromName"] ?? "Hosting Platform Alerts";
            _enableSsl = bool.Parse(_configuration["EmailSettings:EnableSsl"] ?? "true");
        }

        public async Task SendHealthAlertEmailAsync(
            string serverName, 
            string alertTitle, 
            string alertMessage, 
            string severity, 
            List<string> recipients)
        {
            if (recipients == null || !recipients.Any())
            {
                _logger.LogWarning("No recipients specified for health alert email");
                return;
            }

            var subject = $"[{severity.ToUpper()}] Server Health Alert: {serverName}";
            var body = BuildAlertEmailBody(serverName, alertTitle, alertMessage, severity);

            await SendEmailAsync(subject, body, recipients);
        }

        public async Task SendHealthSummaryEmailAsync(string subject, string body, List<string> recipients)
        {
            if (recipients == null || !recipients.Any())
            {
                _logger.LogWarning("No recipients specified for summary email");
                return;
            }

            await SendEmailAsync(subject, body, recipients);
        }

        private async Task SendEmailAsync(string subject, string body, List<string> recipients)
        {
            if (string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
            {
                _logger.LogWarning("Email settings not configured. Email not sent: {Subject}", subject);
                return;
            }

            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(_fromEmail, _fromName);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                foreach (var recipient in recipients)
                {
                    if (!string.IsNullOrWhiteSpace(recipient))
                    {
                        message.To.Add(new MailAddress(recipient.Trim()));
                    }
                }

                if (message.To.Count == 0)
                {
                    _logger.LogWarning("No valid recipients for email: {Subject}", subject);
                    return;
                }

                using var smtpClient = new SmtpClient(_smtpHost, _smtpPort);
                smtpClient.EnableSsl = _enableSsl;
                smtpClient.UseDefaultCredentials = false;
                smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);

                await smtpClient.SendMailAsync(message);
                _logger.LogInformation("Email sent successfully to {RecipientCount} recipients: {Subject}", message.To.Count, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email: {Subject}", subject);
                throw;
            }
        }

        private string BuildAlertEmailBody(string serverName, string alertTitle, string alertMessage, string severity)
        {
            var severityColor = severity.ToLower() switch
            {
                "critical" => "#dc2626",
                "warning" => "#ea580c",
                "info" => "#2563eb",
                _ => "#6b7280"
            };

            var severityBgColor = severity.ToLower() switch
            {
                "critical" => "#fee2e2",
                "warning" => "#ffedd5",
                "info" => "#dbeafe",
                _ => "#f3f4f6"
            };

            return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>Health Alert</title>
</head>
<body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;"">
    <div style=""background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin-bottom: 20px;"">
        <h1 style=""color: #1f2937; margin: 0 0 10px 0;"">Server Health Alert</h1>
        <p style=""color: #6b7280; margin: 0;"">Hosting Platform Management System</p>
    </div>
    
    <div style=""background-color: {severityBgColor}; border-left: 4px solid {severityColor}; padding: 15px; margin-bottom: 20px; border-radius: 5px;"">
        <div style=""display: flex; align-items: center; margin-bottom: 10px;"">
            <span style=""background-color: {severityColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;"">
                {severity}
            </span>
        </div>
        <h2 style=""color: {severityColor}; margin: 10px 0; font-size: 18px;"">{alertTitle}</h2>
    </div>
    
    <div style=""background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;"">
        <h3 style=""color: #1f2937; margin-top: 0; font-size: 16px;"">Server Details</h3>
        <table style=""width: 100%; border-collapse: collapse;"">
            <tr>
                <td style=""padding: 8px 0; color: #6b7280; font-weight: 500;"">Server Name:</td>
                <td style=""padding: 8px 0; color: #1f2937; font-weight: 600;"">{serverName}</td>
            </tr>
            <tr>
                <td style=""padding: 8px 0; color: #6b7280; font-weight: 500;"">Alert Time:</td>
                <td style=""padding: 8px 0; color: #1f2937;"">{DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</td>
            </tr>
        </table>
    </div>
    
    <div style=""background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;"">
        <h3 style=""color: #1f2937; margin-top: 0; font-size: 16px;"">Alert Message</h3>
        <p style=""color: #4b5563; margin: 0;"">{alertMessage}</p>
    </div>
    
    <div style=""background-color: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 20px;"">
        <h4 style=""color: #1f2937; margin-top: 0; font-size: 14px;"">Recommended Actions:</h4>
        <ul style=""color: #4b5563; margin: 5px 0; padding-left: 20px;"">
            <li>Check server resource usage in the dashboard</li>
            <li>Review recent activity and processes</li>
            <li>Consider scaling resources if threshold consistently exceeded</li>
            <li>Acknowledge this alert in the system once reviewed</li>
        </ul>
    </div>
    
    <div style=""text-align: center; padding: 20px; border-top: 1px solid #e5e7eb;"">
        <p style=""color: #6b7280; font-size: 14px; margin: 0 0 10px 0;"">
            This is an automated alert from Hosting Platform Management System
        </p>
        <p style=""color: #9ca3af; font-size: 12px; margin: 0;"">
            To stop receiving these alerts, update your notification preferences in the system settings.
        </p>
    </div>
</body>
</html>";
        }
    }
}
