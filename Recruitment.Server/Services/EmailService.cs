using System.Net;
using System.Net.Mail;
using System.Text;
using Recruitment.Server.Interfaces;

namespace Recruitment.Server.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default)
        {
            try
            {
                var host = _configuration["Email:Host"] ?? "smtp.gmail.com";
                var port = int.Parse(_configuration["Email:Port"] ?? "587");
                var username = _configuration["Email:Username"] ?? "";
                var password = _configuration["Email:Password"] ?? "";
                var fromAddress = _configuration["Email:FromAddress"] ?? "noreply@kca.ac.ke";
                var fromName = _configuration["Email:FromName"] ?? "KCA University Recruitment";
                var enableSsl = bool.Parse(_configuration["Email:EnableSsl"] ?? "true");

                using var client = new SmtpClient(host, port)
                {
                    EnableSsl = enableSsl,
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(username, password)
                };

                using var message = new MailMessage
                {
                    From = new MailAddress(fromAddress, fromName, Encoding.UTF8),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true,
                    BodyEncoding = Encoding.UTF8,
                    SubjectEncoding = Encoding.UTF8
                };
                message.To.Add(new MailAddress(toEmail));

                client.Timeout = 30000; // 30 seconds

                using var internalTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                await client.SendMailAsync(message, internalTimeout.Token);

                _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
                throw;
            }
        }

        public async Task SendActivationEmailAsync(string toEmail, string firstName, string activationToken, string frontendUrl, CancellationToken cancellationToken = default)
        {
            var baseUrl = frontendUrl;
            var currentYear = DateTime.UtcNow.Year;
            var subject = "Welcome to KCA University Recruitment - Activate Your Account";
            var activationLink = $"{baseUrl}/activate?token={Uri.EscapeDataString(activationToken)}&email={Uri.EscapeDataString(toEmail)}";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px; }}
        .header {{ margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }}
        .header h1 {{ font-size: 20px; color: #1c2d5e; margin: 0; }}
        .content {{ margin-bottom: 30px; }}
        .button-container {{ text-align: center; margin: 30px 0; }}
        .button {{ background-color: #1c2d5e; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; }}
        .info-section {{ background-color: #f8f9fa; border-radius: 4px; padding: 15px; margin: 20px 0; font-size: 14px; color: #666666; }}
        .footer {{ font-size: 12px; color: #999999; border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Account Activation</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <p>Thank you for registering with KCA University Recruitment. To complete your account setup and begin your application, please activate your account using the button below:</p>
            
            <div class='button-container'>
                <a href='{activationLink}' class='button'>Activate Account</a>
            </div>
            
            <div class='info-section'>
                <strong>Important Note:</strong>
                <p style='margin: 5px 0 0 0;'>This link will expire in 2 hours. If you did not create this account, you can safely ignore this email.</p>
            </div>
            
            <p style='font-size: 13px;'>Alternative link:<br/>
            <span style='color: #1c2d5e; word-break: break-all;'>{activationLink}</span></p>
        </div>
        <div class='footer'>
            <p>KCA University<br/>&copy; {currentYear} All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody, cancellationToken);
        }

        public async Task SendRegistrationFailedEmailAsync(string toEmail, string firstName, CancellationToken cancellationToken = default)
        {
            var currentYear = DateTime.UtcNow.Year;
            var subject = "Registration Issue - KCA University Recruitment";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px; }}
        .header {{ margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }}
        .header h1 {{ font-size: 20px; color: #d32f2f; margin: 0; }}
        .content {{ margin-bottom: 30px; }}
        .footer {{ font-size: 12px; color: #999999; border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Registration Update</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <p>We encountered an error during your account registration process. While an activation email may have been sent, the account could not be finalized on our system.</p>
            <p><strong>Please ignore any previous activation links.</strong></p>
            <p>We apologize for this inconvenience. Please try registering again in a few minutes. If you continue to experience issues, please contact our support team.</p>
        </div>
        <div class='footer'>
            <p>KCA University<br/>&copy; {currentYear} All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody, cancellationToken);
        }

        public async Task SendPasswordChangeNotificationAsync(string toEmail, string firstName, CancellationToken cancellationToken = default)
        {
            var currentYear = DateTime.UtcNow.Year;
            var subject = "Security Alert - Password Changed";

            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eeeeee; border-radius: 8px; }}
        .header {{ margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }}
        .header h1 {{ font-size: 20px; color: #1c2d5e; margin: 0; }}
        .content {{ margin-bottom: 30px; }}
        .alert-text {{ color: #d32f2f; font-weight: bold; }}
        .footer {{ font-size: 12px; color: #999999; border-top: 1px solid #f0f0f0; padding-top: 20px; text-align: center; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Security Notification</h1>
        </div>
        <div class='content'>
            <p>Hello {firstName},</p>
            <p>This is a confirmation that the password for your KCA University Recruitment account was recently changed.</p>
            <p>If you made this change, no further action is required.</p>
            <p class='alert-text'>If you did not authorize this change, please contact our support team immediately to secure your account.</p>
        </div>
        <div class='footer'>
            <p>KCA University<br/>&copy; {currentYear} All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, subject, htmlBody, cancellationToken);
        }
    }
}
