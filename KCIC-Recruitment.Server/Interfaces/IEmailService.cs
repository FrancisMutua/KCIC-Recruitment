using System.Threading;
using System.Threading.Tasks;

namespace Recruitment.Server.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken = default);
        Task SendActivationEmailAsync(string toEmail, string firstName, string activationToken, string frontendUrl, CancellationToken cancellationToken = default);
        Task SendRegistrationFailedEmailAsync(string toEmail, string firstName, CancellationToken cancellationToken = default);
        Task SendPasswordChangeNotificationAsync(string toEmail, string firstName, CancellationToken cancellationToken = default);
    }
}
