using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;

namespace Recruitment.Server.Services
{
    /// <summary>
    /// Raised when Business Central returns a SOAP fault (e.g. an AL Error() call).
    /// The message is the AL error text, which is normally safe to show to applicants.
    /// </summary>
    public class BusinessCentralException(string message) : Exception(message)
    {
        public bool IsDuplicateRecord =>
            Message.Contains("already exists", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Minimal SOAP client for a Business Central codeunit web service.
    /// Parameter names must match the AL parameter names with the first letter lower-cased
    /// (that is how BC publishes them in the WSDL, e.g. IDPassportNo -> iDPassportNo).
    /// </summary>
    public class BusinessCentralSoapClient
    {
        private static readonly XNamespace SoapNs = "http://schemas.xmlsoap.org/soap/envelope/";
        private readonly HttpClient _http;
        private readonly string _endpoint;
        private readonly XNamespace _serviceNs;

        public BusinessCentralSoapClient(HttpClient http, IConfiguration configuration)
        {
            _http = http;
            _endpoint = configuration["BusinessCentral:BaseUrl"]
                ?? throw new InvalidOperationException("BusinessCentral:BaseUrl is not configured.");

            var username = configuration["BusinessCentral:Username"] ?? string.Empty;
            var password = configuration["BusinessCentral:Password"] ?? string.Empty;
            _http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Basic", Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}")));
            _http.Timeout = TimeSpan.FromMinutes(2);

            // .../WS/{Company}/Codeunit/{ServiceName}
            var serviceName = new Uri(_endpoint).Segments.Last().Trim('/');
            _serviceNs = $"urn:microsoft-dynamics-schemas/codeunit/{serviceName}";
        }

        /// <summary>Calls a codeunit procedure and returns its return_value as text ("" when none).</summary>
        public async Task<string> InvokeAsync(string operation, params (string Name, object? Value)[] parameters)
        {
            var body = new XElement(_serviceNs + operation,
                parameters.Select(p => new XElement(_serviceNs + p.Name, Format(p.Value))));
            var envelope = new XDocument(
                new XElement(SoapNs + "Envelope",
                    new XAttribute(XNamespace.Xmlns + "soap", SoapNs),
                    new XElement(SoapNs + "Body", body)));

            using var request = new HttpRequestMessage(HttpMethod.Post, _endpoint)
            {
                Content = new StringContent(envelope.ToString(SaveOptions.DisableFormatting), Encoding.UTF8, "text/xml")
            };
            request.Headers.Add("SOAPAction", $"\"{_serviceNs.NamespaceName}:{operation}\"");

            using var response = await _http.SendAsync(request);
            var payload = await response.Content.ReadAsStringAsync();

            XDocument document;
            try
            {
                document = XDocument.Parse(payload);
            }
            catch (System.Xml.XmlException)
            {
                throw new HttpRequestException(
                    $"Business Central returned HTTP {(int)response.StatusCode} for {operation}.");
            }

            var fault = document.Descendants().FirstOrDefault(e => e.Name.LocalName == "Fault");
            if (fault != null)
            {
                var message = fault.Descendants().FirstOrDefault(e => e.Name.LocalName == "faultstring")?.Value;
                throw new BusinessCentralException(string.IsNullOrWhiteSpace(message)
                    ? $"Business Central rejected {operation}."
                    : message.Trim());
            }

            if (!response.IsSuccessStatusCode)
                throw new HttpRequestException(
                    $"Business Central returned HTTP {(int)response.StatusCode} for {operation}.");

            return document.Descendants().FirstOrDefault(e => e.Name.LocalName == "return_value")?.Value
                ?? string.Empty;
        }

        public async Task<bool> InvokeBoolAsync(string operation, params (string Name, object? Value)[] parameters)
        {
            var result = await InvokeAsync(operation, parameters);
            return bool.TryParse(result, out var value) && value;
        }

        private static string Format(object? value) => value switch
        {
            null => string.Empty,
            DateTime date => date == DateTime.MinValue ? "0001-01-01" : date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            DateOnly date => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            bool flag => flag ? "true" : "false",
            IFormattable formattable => formattable.ToString(null, CultureInfo.InvariantCulture),
            _ => value.ToString() ?? string.Empty
        };
    }
}
