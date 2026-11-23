import { useState } from "react";
import { toast } from "react-toastify";
import { IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { GenderOptions, MaritalStatusOptions } from "../../../../constants/enums";
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
    `mt-1 block w-full border ${fieldErrors[name] ? "border-brand-camel focus:ring-brand-camel" : "border-slate-300 focus:ring-brand-green"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-brand-brown-600">{fieldErrors[name]}</p> : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Personal Details Header */}
        <div className="col-span-full border-b pb-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
        </div>

        {/* First Name */}
        <div>
           <label className="block text-sm font-medium text-slate-700">First Name <span className="text-brand-brown-600">*</span></label>
           <input type="text" name="firstName" value={profile.firstName} onChange={handleFieldChange} className={inputClass("firstName", "bg-slate-100")} readOnly />
           {renderError("firstName")}
        </div>
        {/* Middle Name */}
        <div>
           <label className="block text-sm font-medium text-slate-700">Middle Name</label>
           <input type="text" name="middleName" value={profile.middleName} onChange={handleFieldChange} className={inputClass("middleName", "bg-slate-100")} readOnly />
           {renderError("middleName")}
        </div>
        {/* Last Name */}
        <div>
           <label className="block text-sm font-medium text-slate-700">Last Name <span className="text-brand-brown-600">*</span></label>
           <input type="text" name="lastName" value={profile.lastName} onChange={handleFieldChange} className={inputClass("lastName", "bg-slate-100")} readOnly />
           {renderError("lastName")}
        </div>
        
        {/* ID Number */}
        <div>
           <label className="block text-sm font-medium text-slate-700">ID / Passport No <span className="text-brand-brown-600">*</span></label>
           <input type="text" name="idNumber" value={profile.idNumber} onChange={handleFieldChange} className={inputClass("idNumber", "bg-slate-100")} readOnly />
           {renderError("idNumber")}
        </div>

        {/* KRA Pin */}
        <div>
           <label className="block text-sm font-medium text-slate-700">KRA Pin <span className="text-brand-brown-600">*</span></label>
           <input type="text" name="kraPin" value={profile.kraPin} onChange={handleFieldChange} className={inputClass("kraPin")} required />
           {renderError("kraPin")}
        </div>

        {/* Email Address */}
        <div>
            <label className="block text-sm font-medium text-slate-700">Email Address <span className="text-brand-brown-600">*</span></label>
            <input type="email" name="emailAddress" value={profile.emailAddress} disabled className={inputClass("emailAddress", "bg-slate-100 cursor-not-allowed")} />
            {renderError("emailAddress")}
        </div>

        {/* The SOAP profile contract retains the legacy initials field name. */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Salutation <span className="text-brand-brown-600">*</span></label>
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
            <label className="block text-sm font-medium text-slate-700">Phone Number <span className="text-brand-brown-600">*</span></label>
            <input type="text" name="phoneNumber" value={profile.phoneNumber} onChange={handleFieldChange} className={inputClass("phoneNumber")} required />
            {renderError("phoneNumber")}
        </div>

        {/* Alt Phone Number */}
        <div>
            <label className="block text-sm font-medium text-slate-700">Alt Phone Number</label>
            <input type="text" name="altPhoneNumber" value={profile.altPhoneNumber} onChange={handleFieldChange} className={inputClass("altPhoneNumber")} />
            {renderError("altPhoneNumber")}
        </div>

        {/* Date of Birth */}
        <div>
             <label className="block text-sm font-medium text-slate-700">Date of Birth <span className="text-brand-brown-600">*</span></label>
             <input type="date" name="birthDate" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} value={profile.birthDate || ''} onChange={handleFieldChange} className={inputClass("birthDate")} required />
             {renderError("birthDate")}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Gender <span className="text-brand-brown-600">*</span></label>
          <select name="gender" value={profile.gender} onChange={handleFieldChange} className={inputClass("gender", "bg-white")} required>
              <option value="">Select Gender</option>
              {GenderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </select>
          {renderError("gender")}
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Marital Status <span className="text-brand-brown-600">*</span></label>
          <select name="maritalStatus" value={profile.maritalStatus} onChange={handleFieldChange} className={inputClass("maritalStatus", "bg-white")} required>
              <option value="">Select Marital Status</option>
              {MaritalStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
          </select>
          {renderError("maritalStatus")}
        </div>

        {/* Citizenship (country codes) */}
        <GlobalDropdown
          source="SOAP"
          type="Citizenship"
          label="Citizenship"
          name="citizenship"
          value={profile.citizenship}
          onChange={(val) => updateField("citizenship", val)}
          placeholder="Select Citizenship"
          required
          error={fieldErrors.citizenship}
        />

        {/* Contact Header */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact & Location</h3>
        </div>

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
          onChange={(val) => updateField("county", val)}
          required
          error={fieldErrors.county}
        />

        {/* Postal Address */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Postal Address <span className="text-brand-brown-600">*</span></label>
          <input type="text" name="postalAddress" value={profile.postalAddress} onChange={handleFieldChange} className={inputClass("postalAddress")} required />
          {renderError("postalAddress")}
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-sm font-medium text-slate-700">Postal Code <span className="text-brand-brown-600">*</span></label>
          <input type="text" name="postalCode" value={profile.postalCode} onChange={handleFieldChange} className={inputClass("postalCode")} required />
          {renderError("postalCode")}
        </div>

        {/* Other Header */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-slate-900">Other Details</h3>
        </div>

        {/* Disability */}
        <div>
             <label className="block text-sm font-medium text-slate-700">Do you have a disability?</label>
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
                    <label className="block text-sm font-medium text-slate-700">PWD Number <span className="text-brand-brown-600">*</span></label>
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
          className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving && <IconLoader2 size={18} className="animate-spin" />}
          {saving ? "Saving..." : "Next"}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;
