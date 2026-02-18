using System.ServiceModel;
using NAVWS;
using Recruitment.Server.Interfaces;

namespace Recruitment.Server.Services
{
    public class WebService(IConfiguration configuration) : IWebService
    {
        private readonly string baseUrl = configuration["BusinessCentral:BaseUrl"]!;
        private readonly string username = configuration["BusinessCentral:Username"]!;
        private readonly string password = configuration["BusinessCentral:Password"]!;
        public Recruitment_PortClient ObjNav()
        {
            try
            {
                var binding = new BasicHttpBinding(BasicHttpSecurityMode.TransportCredentialOnly)
                {
                    Security =
                    {
                        Transport = new HttpTransportSecurity()
                        {
                            ClientCredentialType = HttpClientCredentialType.Basic
                        }
                    },
                    MaxReceivedMessageSize = 64 * 1024 * 1024, // 64 MB
                    MaxBufferSize = 64 * 1024 * 1024
                };

                binding.SendTimeout = TimeSpan.FromMinutes(2);

                var endPointAddress = new EndpointAddress(baseUrl);
                var client = new Recruitment_PortClient(binding, endPointAddress);
                client.ClientCredentials.UserName.UserName = username;
                client.ClientCredentials.UserName.Password = password;
                return client;
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
