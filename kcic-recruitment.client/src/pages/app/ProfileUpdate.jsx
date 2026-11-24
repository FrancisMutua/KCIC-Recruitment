import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { Field } from "../../components/application/Field";
import { isShown, validateFields } from "../../lib/fieldRules";
import { validateBirthDate, salutationValue } from "../../lib/applicationValidation";
import { GenderOptions, MaritalStatusOptions, SalutationOptions, optionValue } from "../../constants/enums";
import { apiFetch, readJson } from "../../lib/http";

// Codeunit 70007 UpdateApplicantProfile overwrites every one of these fields, so all are always sent.
// The profile prefills the Personal Details of each new application.
const readOnlyFields = [
  { name: "firstName", label: "First Name" },
  { name: "middleName", label: "Middle Name" },
  { name: "lastName", label: "Last Name" },
  { name: "idNumber", label: "ID / Passport No" },
  { name: "emailAddress", label: "Email Address" },
];
const sections = [
  {
    title: "Personal Details",
    fields: [
      { name: "salutation", label: "Salutation", type: "select", options: SalutationOptions },
      { name: "phoneNumber", label: "Phone Number", type: "tel", required: true, hint: "Kenyan number, e.g. 0712 345 678." },
      { name: "birthDate", label: "Date of Birth", type: "date", required: true },
      { name: "gender", label: "Gender", type: "select", options: GenderOptions, required: true },
      { name: "maritalStatus", label: "Marital Status", type: "select", options: MaritalStatusOptions },
    ],
  },
  {
    title: "Contact & Location",
    fields: [
      { name: "country", label: "Country of Residence", type: "lookup", lookupType: "Countries", required: true },
      { name: "postalAddress", label: "Postal Address", required: true, maxLength: 80 },
      { name: "postalCode", label: "Postal Code", maxLength: 20 },
    ],
  },
  {
    title: "Disability",
    fields: [
      { name: "disability", label: "Do you have a disability?", type: "yesno" },
      { name: "disabilityStatus", label: "Nature of Disability", required: true, maxLength: 250, show: (v) => v.disability },
      { name: "pwdNumber", label: "NCPWD Registration Number", required: true, maxLength: 250, show: (v) => v.disability },
    ],
  },
];

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [profile, setProfile] = useState({
    firstName: "", middleName: "", lastName: "", idNumber: "", emailAddress: "",
    salutation: "", phoneNumber: "", birthDate: "", gender: "", maritalStatus: "",
    country: "", postalAddress: "", postalCode: "", disability: false, disabilityStatus: "", pwdNumber: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user?.accessToken) {
          navigate("/");
          return;
        }
        const response = await apiFetch("/api/auth/profile", { headers: { Authorization: `Bearer ${user.accessToken}` } });
        const result = await readJson(response);
        if (!result.success) throw new Error(result.message || result.Message);
        const d = result.data || {};
        setProfile({
          firstName: d.FirstName || "",
          middleName: d.MiddleName || "",
          lastName: d.LastName || "",
          idNumber: d.IDNumber || "",
          emailAddress: d.EmailAddress || "",
          salutation: salutationValue(d.Initials),
          phoneNumber: d.TelephoneNo || "",
          birthDate: d.DateOfBirth || "",
          gender: optionValue(GenderOptions, d.Gender),
          maritalStatus: optionValue(MaritalStatusOptions, d.MaritalStatus),
          country: d.Country || "",
          postalAddress: d.PostalAddress || "",
          postalCode: d.PostCode || "",
          disability: d.Disability === true,
          disabilityStatus: d.DisabilityStatus || "",
          pwdNumber: d.PwdNumber || "",
        });
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile details.");
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const change = (name, value) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateFields(sections.flatMap((s) => s.fields), profile);
    if (!found.birthDate) {
      const birthError = validateBirthDate(profile.birthDate);
      if (birthError) found.birthDate = birthError;
    }
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch("/api/auth/updateprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({
          salutation: profile.salutation,
          phoneNumber: String(profile.phoneNumber || ""),
          gender: profile.gender,
          maritalStatus: profile.maritalStatus,
          postalCode: profile.postalCode,
          postalAddress: profile.postalAddress,
          birthDate: profile.birthDate || null,
          disability: profile.disability,
          disabilityStatus: profile.disabilityStatus,
          pwdNumber: profile.pwdNumber,
          country: profile.country,
        }),
      });
      const result = await readJson(response);
      if (!result.success) throw new Error(result.message || result.Message);
      toast.success(result.message);
      // Keep the stored BC profile (PascalCase) so the header name still shows; update the fields just saved.
      const stored = JSON.parse(localStorage.getItem("userProfile") || "{}");
      localStorage.setItem("userProfile", JSON.stringify({
        ...stored, TelephoneNo: profile.phoneNumber, Gender: profile.gender, PostalAddress: profile.postalAddress, Country: profile.country,
      }));
      navigate("/app");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen justify-center items-center">
        <IconLoader2 className="animate-spin text-brand-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-2 px-2">
      <div className="max-w-full mx-auto bg-white rounded-2xl shadow-sm border border-slate-200/80">
        <form onSubmit={handleSubmit} className="p-8 space-y-8" noValidate>
          <p className="text-sm text-slate-600">Your profile fills in the personal details of each new application, so you only type them once.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readOnlyFields.map((field) => (
              <div key={field.name}>
                <span className="block text-sm font-medium text-slate-700">{field.label}</span>
                <input value={profile[field.name]} readOnly title="Cannot be modified"
                  className="mt-1 block w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-slate-100" />
              </div>
            ))}
          </div>
          {sections.map((section) => (
            <section key={section.title} className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{section.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.fields.filter((field) => isShown(field, profile)).map((field) =>
                  <Field key={field.name} field={field} value={profile[field.name]} error={errors[field.name]} onChange={change} disabled={loading} />)}
              </div>
            </section>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={loading}
              className="btn-primary px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-colors font-semibold flex items-center gap-2">
              {loading ? <IconLoader2 className="animate-spin" size={20} /> : <IconDeviceFloppy size={20} />}
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
