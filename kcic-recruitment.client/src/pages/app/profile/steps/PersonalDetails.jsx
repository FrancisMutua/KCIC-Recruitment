import { useState } from "react";
import { toast } from "react-toastify";
import { IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { GenderOptions, MaritalStatusOptions, SalutationOptions } from "../../../../constants/enums";
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
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-brand-green"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

  const readOnlyInput = (name, label, required = false, hint = "") => (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label} {required && <span className="text-red-600">*</span>}</label>
      <input type="text" name={name} value={profile[name]} readOnly className={inputClass(name, "bg-slate-100")} />
      {renderError(name) || (hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>)}
    </div>
  );

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[name]}</p> : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Section 2 of the KCIC application form */}
        <div className="col-span-full border-b pb-2 mb-2">
            <h3 className="text-lg font-semibold text-slate-900">2. Personal Details</h3>
            <p className="text-sm text-slate-600">Your name and ID number come from your account and cannot be changed here.</p>
        </div>

        {readOnlyInput("lastName", "Surname", true)}
        {readOnlyInput("firstName", "First Name", true)}
        {readOnlyInput("middleName", "Other Name(s)")}

        <div>
          <label className="block text-sm font-medium text-slate-700">Title <span className="text-red-600">*</span></label>
          <select name="initials" value={profile.initials} onChange={handleFieldChange} className={inputClass("initials", "bg-white")} required>
              <option value="">Select Title</option>
              {SalutationOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {renderError("initials")}
        </div>

        <div>
             <label className="block text-sm font-medium text-slate-700">Date of Birth <span className="text-red-600">*</span></label>
             <input type="date" name="birthDate" max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]} value={profile.birthDate || ''} onChange={handleFieldChange} className={inputClass("birthDate")} required />
             {renderError("birthDate")}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Gender <span className="text-red-600">*</span></label>
          <select name="gender" value={profile.gender} onChange={handleFieldChange} className={inputClass("gender", "bg-white")} required>
              <option value="">Select Gender</option>
              {GenderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {renderError("gender")}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Nationality <span className="text-red-600">*</span></label>
          <input type="text" name="nationality" value={profile.nationality} onChange={handleFieldChange} maxLength={60} placeholder="e.g. Kenyan" className={inputClass("nationality")} required />
          {renderError("nationality")}
        </div>

        {readOnlyInput("idNumber", "ID No / Passport No", true, "Attach a copy in the Attachments step.")}

        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-slate-900">Contact Details</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Address <span className="text-red-600">*</span></label>
          <input type="text" name="postalAddress" value={profile.postalAddress} onChange={handleFieldChange} maxLength={80} placeholder="e.g. P.O. Box 123" className={inputClass("postalAddress")} required />
          {renderError("postalAddress")}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Postal Code <span className="text-red-600">*</span></label>
          <input type="text" name="postalCode" value={profile.postalCode} onChange={handleFieldChange} maxLength={20} className={inputClass("postalCode")} required />
          {renderError("postalCode")}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">E-mail <span className="text-red-600">*</span></label>
            <input type="email" name="emailAddress" value={profile.emailAddress} disabled className={inputClass("emailAddress", "bg-slate-100 cursor-not-allowed")} />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">Mobile <span className="text-red-600">*</span></label>
            <input type="tel" name="phoneNumber" value={profile.phoneNumber} onChange={handleFieldChange} className={inputClass("phoneNumber")} placeholder="0712 345 678" required />
            {renderError("phoneNumber") || <p className="mt-1 text-xs text-slate-500">Kenyan number, e.g. 0712 345 678.</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">Telephone</label>
            <input type="tel" name="altPhoneNumber" value={profile.altPhoneNumber} onChange={handleFieldChange} className={inputClass("altPhoneNumber")} placeholder="Optional" />
            {renderError("altPhoneNumber")}
        </div>

        <div className="hidden lg:block" />

        <div>
          <label className="block text-sm font-medium text-slate-700">Alternative Contact Person</label>
          <input type="text" name="altContactPerson" value={profile.altContactPerson} onChange={handleFieldChange} maxLength={100} className={inputClass("altContactPerson")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Alternative Contact Telephone</label>
          <input type="tel" name="altContactPhone" value={profile.altContactPhone} onChange={handleFieldChange} maxLength={30} className={inputClass("altContactPhone")} />
        </div>

        {/* Not on the KCIC form, but kept on the BC application when given. */}
        <div className="col-span-full border-b pb-2 mb-2 mt-4">
            <h3 className="text-lg font-semibold text-slate-900">Additional Details <span className="text-sm font-normal text-slate-500">(optional)</span></h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Marital Status</label>
          <select name="maritalStatus" value={profile.maritalStatus} onChange={handleFieldChange} className={inputClass("maritalStatus", "bg-white")}>
              <option value="">Select Marital Status</option>
              {MaritalStatusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
           <label className="block text-sm font-medium text-slate-700">KRA PIN</label>
           <input type="text" name="kraPin" value={profile.kraPin} onChange={handleFieldChange} maxLength={20} className={inputClass("kraPin")} />
        </div>

        <GlobalDropdown source="SOAP" type="Citizenship" label="Citizenship" name="citizenship" value={profile.citizenship}
          onChange={(val) => updateField("citizenship", val)} placeholder="Select Citizenship" />

        <GlobalDropdown source="SOAP" type="Countries" label="Country of Residence" name="country" value={profile.country}
          onChange={(val) => updateField("country", val)} />

        <GlobalDropdown source="SOAP" type="County" label="County of Residence" name="county" value={profile.county}
          onChange={(val) => updateField("county", val)} />

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
