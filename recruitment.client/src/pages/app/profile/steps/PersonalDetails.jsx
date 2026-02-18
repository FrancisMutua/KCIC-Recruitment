import { useState } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { GenderOptions, MaritalStatusOptions } from "../../../../constants/enums";

const PersonalDetails = ({ profile, handleChange, onNext, saving }) => {
  const [countyFilter, setCountyFilter] = useState("");
  const [subCountyFilter, setSubCountyFilter] = useState("");
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Personal Details Header */}
        <div className="col-span-full border-b pb-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
        </div>

        {/* First Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">First Name</label>
           <input type="text" name="firstName" value={profile.firstName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly />
        </div>
        {/* Middle Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Middle Name</label>
           <input type="text" name="middleName" value={profile.middleName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly />
        </div>
        {/* Last Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Last Name</label>
           <input type="text" name="lastName" value={profile.lastName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly />
        </div>
        
        {/* ID Number */}
        <div>
           <label className="block text-sm font-medium text-gray-700">ID / Passport No</label>
           <input type="text" name="idNumber" value={profile.idNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100" readOnly />
        </div>

        {/* KRA Pin */}
        <div>
           <label className="block text-sm font-medium text-gray-700">KRA Pin <span className="text-red-500">*</span></label>
           <input type="text" name="kraPin" value={profile.kraPin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>

        {/* Email Address */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="emailAddress" value={profile.emailAddress} disabled className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm p-2 cursor-not-allowed" />
        </div>

        {/* Initials */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Initials <span className="text-red-500">*</span></label>
          <select name="initials" value={profile.initials} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" required>
              <option value="">Select Initials</option>
              <option value="0">Mr.</option>
              <option value="1">Miss.</option>
              <option value="2">Mrs.</option>
          </select>
        </div>

        {/* Phone Number */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
            <input type="text" name="phoneNumber" value={profile.phoneNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>

        {/* Alt Phone Number */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Alt Phone Number</label>
            <input type="text" name="altPhoneNumber" value={profile.altPhoneNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>

        {/* Date of Birth */}
        <div>
             <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
             <input type="date" name="birthDate" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} value={profile.birthDate || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
          <select name="gender" value={profile.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" required>
              <option value="">Select Gender</option>
              {GenderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </select>
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Marital Status <span className="text-red-500">*</span></label>
          <select name="maritalStatus" value={profile.maritalStatus} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" required>
              <option value="">Select Status</option>
              {MaritalStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </select>
        </div>

        {/* Citizenship */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Citizenship <span className="text-red-500">*</span></label>
          <select name="citizenship" value={profile.citizenship} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" required>
              <option value="">Select Citizenship</option>
              <option value="KE">Kenya</option>
          </select>
        </div>

        {/* Contact Header */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Contact & Location</h3>
        </div>

        {/* Country */}
        {/* Country */}
        <GlobalDropdown
          source="SOAP"
          type="Countries"
          code="Code"
          description="Name"
          label="Country"
          name="country"
          value={profile.country}
          onChange={(val) => handleChange({ target: { name: "country", value: val } })}
          required
        />

        {/* County (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="County"
          label="County"
          name="county"
          value={profile.county}
          onChange={(val, opt) => {
            const countyName = opt?.text || "";
            // Convert to Title Case to match NAV format (e.g., "BARINGO" -> "Baringo")
            const titleCased = countyName.charAt(0).toUpperCase() + countyName.slice(1).toLowerCase();
            setCountyFilter(titleCased);
            handleChange({ target: { name: "county", value: val } });
          }}
          required
        />

        {/* Sub County (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="SubCounty"
          filters={{ County: countyFilter }}
          label="Sub County"
          name="subCounty"
          value={profile.subCounty}
          onChange={(val, opt) => {
            const scName = opt?.text || "";
            // Convert to Title Case to match NAV format
            const titleCased = scName.charAt(0).toUpperCase() + scName.slice(1).toLowerCase();
            setSubCountyFilter(titleCased);
            handleChange({ target: { name: "subCounty", value: val } });
          }}
          required
          disabled={!profile.county}
        />

        {/* Ward (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="Ward"
          filters={{ SubCounty: subCountyFilter }}
          label="Ward"
          name="wardCode"
          value={profile.wardCode}
          onChange={(val) => handleChange({ target: { name: "wardCode", value: val } })}
          required
          disabled={!profile.subCounty}
        />

        {/* Postal Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Address <span className="text-red-500">*</span></label>
          <input type="text" name="postalAddress" value={profile.postalAddress} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></label>
          <input type="text" name="postalCode" value={profile.postalCode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
        </div>

        {/* Other Header */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Other Details</h3>
        </div>

        {/* Disability */}
        <div>
             <label className="block text-sm font-medium text-gray-700">Do you have a disability?</label>
             <select name="disability" value={profile.disability} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                 <option value="false">No</option>
                 <option value="true">Yes</option>
             </select>
        </div>

        {/* Conditional Disability Fields */}
        {(profile.disability === "true" || profile.disability === true) && (
            <>
                {/* Disability Type (SOAP) */}
                <GlobalDropdown
                  source="SOAP"
                  type="Disability Type"
                  label="Disability Type"
                  name="disabilityStatus"
                  value={profile.disabilityStatus} 
                  onChange={(val) => handleChange({ target: { name: "disabilityStatus", value: val } })}
                  required
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">PWD Number <span className="text-red-500">*</span></label>
                    <input type="text" name="pwdNumber" value={profile.pwdNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
            </>
        )}

      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            const requiredFields = [
              { key: "kraPin", label: "KRA Pin" },
              { key: "initials", label: "Initials" },
              { key: "phoneNumber", label: "Phone Number" },
              { key: "birthDate", label: "Date of Birth" },
              { key: "gender", label: "Gender" },
              { key: "maritalStatus", label: "Marital Status" },
              { key: "citizenship", label: "Citizenship" },
              { key: "country", label: "Country" },
              { key: "county", label: "County" },
              { key: "subCounty", label: "Sub County" },
              { key: "wardCode", label: "Ward" },
              { key: "postalAddress", label: "Postal Address" },
              { key: "postalCode", label: "Postal Code" },
            ];

            const missing = requiredFields.filter(field => !profile[field.key]);

            if (missing.length > 0) {
              import("react-toastify").then(({ toast }) => {
                toast.error(`Please fill in the following required fields: ${missing.map(f => f.label).join(", ")}`);
              });
              return;
            }
            
            // Disability specific validation
            if (profile.disability === "true" || profile.disability === true) {
                if (!profile.disabilityStatus) {
                    import("react-toastify").then(({ toast }) => toast.error("Please select a Disability Type"));
                    return;
                }
                if (!profile.pwdNumber) {
                    import("react-toastify").then(({ toast }) => toast.error("Please enter PWD Number"));
                    return;
                }
            }

            onNext();
          }}
          disabled={saving}
          className="bg-cyan-700 text-white px-6 py-2 rounded-md hover:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <IconLoader2 size={18} className="animate-spin" />}
          {saving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;
