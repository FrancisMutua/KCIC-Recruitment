using System.Collections.Generic;
using System.Threading.Tasks;
using Recruitment.Server.DTOs;

namespace Recruitment.Server.Interfaces
{
    public interface IDropDownService
    {
        Task<List<DropDownOption>> GetDropDownLists(string page, string code, string description, int merge);
        Task<List<DropDownOption>> GetSoapDropDownLists(string dropdownType, Dictionary<string, object>? filters = null);
        string BuildODataQuery(DropDownRequest request);
        Task<List<DropDownOption>> GetSubCountiesList(string countyName = "");
        Task<List<DropDownOption>> GetWardsList(string subCountyName = "");
        Task<List<DropDownOption>> GetDisabilityTypesList();
    }
}
