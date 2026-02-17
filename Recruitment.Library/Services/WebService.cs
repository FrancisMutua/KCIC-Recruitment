using Microsoft.Extensions.Configuration;
using NAVWS;
using Recruitment.Library.Interfaces;
using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.Text;

namespace Recruitment.Library.Services
{
    public class WebService(IConfiguration config) : IWebService
    {
        private readonly string _baseUrl = config["BusinessCentral:BaseUrl"]!;
        private readonly string _username = config["BusinessCentral:Username"]!;
        private readonly string _password = config["BusinessCentral:Password"]!;
        public Recruitment_PortClient ObjNav()
        {
            try
            {
                // 1. Configure the communication binding (SOAP 1.1)
                // BasicHttpSecurityMode.TransportCredentialOnly sends credentials in plain text over HTTP.
                // NOTE: In production, 'Transport' (HTTPS) is recommended for security.
                var binding = new BasicHttpBinding(BasicHttpSecurityMode.TransportCredentialOnly)
                {
                    Security =
                    {
                        Transport = new HttpTransportSecurity()
                        {
                            // Set authentication type to Basic (Username/Password)
                            ClientCredentialType = HttpClientCredentialType.Basic
                        }
                    },

                    // 2. Increase the message size limits from the default (64KB) to 64MB.
                    // This prevents 'Maximum message size exceeded' errors when receiving large datasets.
                    MaxReceivedMessageSize = 64 * 1024 * 1024, // 64 MB
                    MaxBufferSize = 64 * 1024 * 1024
                };

                // 3. Define the service URL (Where the service is hosted)
                var endPointAddress = new EndpointAddress(_baseUrl);

                // 4. Instantiate the generated Service Proxy Client
                var client = new Recruitment_PortClient(binding, endPointAddress);

                // 5. Inject the credentials for Basic Authentication
                client.ClientCredentials.UserName.UserName = _username;
                client.ClientCredentials.UserName.Password = _password;

                return client;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
