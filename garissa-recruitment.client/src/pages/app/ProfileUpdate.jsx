import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader, Spinner } from "../../components/ui/kit";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../components/ui/GlobalDropdown";
import { validatePersonalDetails, personalRequiredFields } from "../../lib/applicationValidation";
import { GenderOptions, ProfileMaritalStatusOptions, optionValue } from "../../constants/enums";
import { toIsoDate } from "../../lib/bcDate";
import { apiFetch, readJson } from "../../lib/http";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const renderError = (name) => fieldErrors[name] ? <p role="alert" className="field-error">{fieldErrors[name]}</p> : null;
  const [profile, setProfile] = useState({
    emailAddress: "",
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    phoneNumber: "",
    gender: "",
    maritalStatus: "0",
    postalAddress: "",
    birthDate: "",
    country: "",
  });



  const formatNavDate = (dateStr) => toIsoDate(dateStr);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.accessToken) {
          navigate("/");
          return;
        }

        const response = await apiFetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        const result = await readJson(response);
        if (result.success) {
          const d = result.data;
          // Map PascalCase API response to camelCase state
          setProfile((prev) => ({
            ...prev,
            firstName: d.FirstName || prev.firstName,
            middleName: d.MiddleName || prev.middleName,
            lastName: d.LastName || prev.lastName,
            idNumber: d.IdNumber || prev.idNumber,
            emailAddress: d.EmailAddress || prev.emailAddress,
            // Handle Phone: API sends 0 for empty usually
            phoneNumber: (d.TelephoneNo && d.TelephoneNo !== 0) ? d.TelephoneNo.toString() : prev.phoneNumber,
            postalAddress: d.PostalAddress || prev.postalAddress,
            birthDate: formatNavDate(d.DateOfBirth) || prev.birthDate,
            
            // Map Dropdowns if text is returned
            maritalStatus: optionValue(ProfileMaritalStatusOptions, d.MaritalStatus) || prev.maritalStatus,
            gender: optionValue(GenderOptions, d.Gender) || prev.gender,
            
            // Other fields not in the snippet but strictly mapped
            country: d.Country || prev.country,
          }));
        } else {
          toast.error(result.message || result.Message);
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch profile details.");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = personalRequiredFields.filter(([key]) =>
      ["phoneNumber", "birthDate", "gender", "country", "postalAddress"].includes(key));
    const errors = validatePersonalDetails(profile, new Date(), required);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error("Please correct the highlighted fields.");
      return;
    }

    setLoading(true);
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        
        // Convert types for backend
        // Fields stored on the BC OnlineUsers record (copied onto each new application).
        const payload = {
            phoneNumber: String(profile.phoneNumber || ""),
            gender: Number(profile.gender) || 0,
            maritalStatus: Number(profile.maritalStatus) || 0,
            postalAddress: profile.postalAddress,
            birthDate: profile.birthDate ? profile.birthDate : null,
            country: profile.country
        };

      const response = await apiFetch("/api/auth/updateprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await readJson(response);
      if (result.success) {
        toast.success(result.message);
        // New applications copy these details, so the dashboard no longer needs to prompt for them.
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...stored, isProfileUpdated: true }));
        navigate(location.state?.next || "/app");
      } else {
        throw new Error(result.message || result.Message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Spinner label="Loading your profile…" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Update your profile" subtitle="Fields marked * are required. These details are copied onto every new application you start." />
      <div className="card">
        <form onSubmit={handleSubmit} className="card-body" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Details */}
            <div className="col-span-full border-b border-slate-100 pb-2">
                <h3 className="section-title">Personal Details</h3>
            </div>

            <div>
              <label className="field-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="field-input"
                readOnly 
                title="Cannot be modified"
              />
            </div>
             <div>
              <label className="field-label">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={profile.middleName}
                onChange={handleChange}
                className="field-input"
                readOnly
                 title="Cannot be modified"
              />
            </div>
             <div>
              <label className="field-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="field-input"
                 readOnly
                  title="Cannot be modified"
              />
            </div>
            
             <div>
              <label className="field-label">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={profile.idNumber}
                onChange={handleChange}
                className="field-input"
                readOnly
              />
            </div>

             <div>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={profile.emailAddress}
                onChange={handleChange}
                className="field-input"
                readOnly
              />
            </div>

            <div>
              <label className="field-label">Phone Number <span className="text-brand-brown-600">*</span></label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="field-input"
                required
              />
              {renderError("phoneNumber")}
            </div>
            
             <div>
              <label className="field-label">Date of Birth <span className="text-brand-brown-600">*</span></label>
              <input
                type="date"
                name="birthDate"
                value={profile.birthDate || ''}
                onChange={handleChange}
                className="field-input"
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              />
              {renderError("birthDate")}
            </div>

            <div>
              <label className="field-label">Gender <span className="text-brand-brown-600">*</span></label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="field-input"
                required
              >
                  <option value="">Select Gender</option>
                  {GenderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {renderError("gender")}
            </div>

            <div>
              <label className="field-label">Marital Status</label>
              <select
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleChange}
                className="field-input"
              >
                  {ProfileMaritalStatusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>


            
             <div>
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
                error={fieldErrors.country}
              />
            </div>

            {/* Address & Contact */}
             <div className="col-span-full border-b border-slate-100 pb-2 mt-4">
                <h3 className="section-title">Contact & Location</h3>
            </div>

            <div>
              <label className="field-label">Postal Address <span className="text-brand-brown-600">*</span></label>
              <input
                type="text"
                name="postalAddress"
                value={profile.postalAddress}
                onChange={handleChange}
                className="field-input"
                required
              />
              {renderError("postalAddress")}
            </div>

          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <IconLoader2 className="animate-spin" size={18} /> : <IconDeviceFloppy size={18} />}
              {loading ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
