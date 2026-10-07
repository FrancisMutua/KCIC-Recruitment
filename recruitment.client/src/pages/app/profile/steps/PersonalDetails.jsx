import { useState } from "react";
import { toast } from "react-toastify";
import { IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { GenderOptions } from "../../../../constants/enums";
import { validatePersonalDetails } from "../../../../lib/applicationValidation";

const PersonalDetails = ({ profile, handleChange, onNext, saving }) => {
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name, value) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    handleChange({ target: { name, value } });
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const inputClass = (name, extra = "") =>
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-brand-navy"} rounded-md shadow-sm p-2 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-500">{fieldErrors[name]}</p> : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Personal Details Header */}
        <div className="col-span-full border-b pb-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
        </div>

        {/* First Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
           <input type="text" name="firstName" value={profile.firstName} onChange={handleFieldChange} className={inputClass("firstName", "bg-gray-100")} readOnly />
           {renderError("firstName")}
        </div>
        {/* Middle Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Middle Name</label>
           <input type="text" name="middleName" value={profile.middleName} onChange={handleFieldChange} className={inputClass("middleName", "bg-gray-100")} readOnly />
           {renderError("middleName")}
        </div>
        {/* Last Name */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
           <input type="text" name="lastName" value={profile.lastName} onChange={handleFieldChange} className={inputClass("lastName", "bg-gray-100")} readOnly />
           {renderError("lastName")}
        </div>
        
        {/* ID Number */}
        <div>
           <label className="block text-sm font-medium text-gray-700">ID / Passport No <span className="text-red-500">*</span></label>
           <input type="text" name="idNumber" value={profile.idNumber} onChange={handleFieldChange} className={inputClass("idNumber", "bg-gray-100")} readOnly />
           {renderError("idNumber")}
        </div>

        {/* KRA Pin */}
        <div>
           <label className="block text-sm font-medium text-gray-700">KRA Pin <span className="text-red-500">*</span></label>
           <input type="text" name="kraPin" value={profile.kraPin} onChange={handleFieldChange} className={inputClass("kraPin")} required />
           {renderError("kraPin")}
        </div>

        {/* Email Address */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="emailAddress" value={profile.emailAddress} disabled className={inputClass("emailAddress", "bg-gray-100 cursor-not-allowed")} />
            {renderError("emailAddress")}
        </div>

        {/* The SOAP profile contract retains the legacy initials field name. */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Salutation <span className="text-red-500">*</span></label>
          <select name="initials" value={profile.initials} onChange={handleFieldChange} className={inputClass("initials", "bg-white")} required>
              <option value="">Select Salutation</option>
              <option value="0">Mr.</option>
              <option value="1">Mrs.</option>
              <option value="2">Miss.</option>
              <option value="3">Dr.</option>
              <option value="4">Prof.</option>
          </select>
          {renderError("initials")}
        </div>

        {/* Phone Number */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
            <input type="text" name="phoneNumber" value={profile.phoneNumber} onChange={handleFieldChange} className={inputClass("phoneNumber")} required />
            {renderError("phoneNumber")}
        </div>

        {/* Alt Phone Number */}
        <div>
            <label className="block text-sm font-medium text-gray-700">Alt Phone Number <span className="text-red-500">*</span></label>
            <input type="text" name="altPhoneNumber" value={profile.altPhoneNumber} onChange={handleFieldChange} className={inputClass("altPhoneNumber")} required />
            {renderError("altPhoneNumber")}
        </div>

        {/* Date of Birth */}
        <div>
             <label className="block text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
             <input type="date" name="birthDate" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} value={profile.birthDate || ''} onChange={handleFieldChange} className={inputClass("birthDate")} required />
             {renderError("birthDate")}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
          <select name="gender" value={profile.gender} onChange={handleFieldChange} className={inputClass("gender", "bg-white")} required>
              <option value="">Select Gender</option>
              {GenderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </select>
          {renderError("gender")}
        </div>

        {/* Citizenship */}
        <GlobalDropdown
          source="SOAP"
          type="Citizenship"
          label="Citizenship"
          name="citizenship"
          value={profile.citizenship}
          onChange={(val) => updateField("citizenship", val)}
          placeholder="Select Citizenship"
          error={fieldErrors.citizenship}
        />

        {/* Ethnicity (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="Ethnicity"
          label="Ethnicity"
          name="ethnicity"
          value={profile.ethnicity}
          onChange={(val) => updateField("ethnicity", val)}
          required
          error={fieldErrors.ethnicity}
        />

        {/* Current Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Salary <span className="text-red-500">*</span></label>
          <input type="number" name="currentSalary" value={profile.currentSalary} onChange={handleFieldChange} min="0" step="0.01" className={inputClass("currentSalary")} required />
          {renderError("currentSalary")}
        </div>

        {/* Expected Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Expected Salary <span className="text-red-500">*</span></label>
          <input type="number" name="expectedSalary" value={profile.expectedSalary} onChange={handleFieldChange} min="0" step="0.01" className={inputClass("expectedSalary")} required />
          {renderError("expectedSalary")}
        </div>

        {/* Notice Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Notice Period <span className="text-red-500">*</span></label>
          <input type="text" name="noticePeriod" value={profile.noticePeriod} onChange={handleFieldChange} placeholder="e.g. 30 days" className={inputClass("noticePeriod")} required />
          {renderError("noticePeriod")}
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
          onChange={(val) => updateField("country", val)}
          required
          error={fieldErrors.country}
        />

        {/* County (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="County"
          label="Current County of Residence"
          name="county"
          value={profile.county}
          onChange={(val) => {
            if (val !== profile.county) {
              updateField("subCounty", "");
              updateField("wardCode", "");
            }
            updateField("county", val);
          }}
          required
          error={fieldErrors.county}
        />

        {/* Sub County (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="SubCounty"
          filters={{ County: profile.county || "" }}
          label="Sub County"
          name="subCounty"
          value={profile.subCounty}
          onChange={(val) => {
            if (val !== profile.subCounty) {
              updateField("wardCode", "");
            }
            updateField("subCounty", val);
          }}
          required
          disabled={!profile.county}
          error={fieldErrors.subCounty}
        />

        {/* Ward (SOAP) */}
        <GlobalDropdown
          source="SOAP"
          type="Ward"
          filters={{ SubCounty: profile.subCounty || "" }}
          label="Ward"
          name="wardCode"
          value={profile.wardCode}
          onChange={(val) => updateField("wardCode", val)}
          required
          disabled={!profile.subCounty}
          error={fieldErrors.wardCode}
        />

        {/* Postal Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Address <span className="text-red-500">*</span></label>
          <input type="text" name="postalAddress" value={profile.postalAddress} onChange={handleFieldChange} className={inputClass("postalAddress")} required />
          {renderError("postalAddress")}
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></label>
          <input type="text" name="postalCode" value={profile.postalCode} onChange={handleFieldChange} className={inputClass("postalCode")} required />
          {renderError("postalCode")}
        </div>

        {/* Other Header */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Other Details</h3>
        </div>

        {/* Disability */}
        <div>
             <label className="block text-sm font-medium text-gray-700">Do you have a disability?</label>
             <select name="disability" value={profile.disability} onChange={handleFieldChange} className={inputClass("disability", "bg-white")}>
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
                  onChange={(val) => updateField("disabilityStatus", val)}
                  required
                  error={fieldErrors.disabilityStatus}
                />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">PWD Number <span className="text-red-500">*</span></label>
                    <input type="text" name="pwdNumber" value={profile.pwdNumber} onChange={handleFieldChange} className={inputClass("pwdNumber")} required />
                    {renderError("pwdNumber")}
                </div>
            </>
        )}

      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={(e) => {
            e.preventDefault();
            const errors = validatePersonalDetails(profile);
            setFieldErrors(errors);
            if (Object.keys(errors).length) {
              toast.error("Please complete the highlighted required fields.");
              return;
            }

            setFieldErrors({});
            onNext();
          }}
          disabled={saving}
          className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <IconLoader2 size={18} className="animate-spin" />}
          {saving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;
