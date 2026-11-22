import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../components/ui/GlobalDropdown";
import { validatePersonalDetails, personalRequiredFields } from "../../lib/applicationValidation";
import { GenderOptions, ProfileMaritalStatusOptions, optionValue } from "../../constants/enums";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const renderError = (name) => fieldErrors[name] ? <p role="alert" className="mt-1 text-xs text-brand-brown-600">{fieldErrors[name]}</p> : null;
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



  // Helper to format NAV date (MM/DD/YY) to Input Date (YYYY-MM-DD)
  const formatNavDate = (dateStr) => {
      if (!dateStr) return "";
      
      // If already has T (ISO), just take first part
      if (dateStr.includes('T')) return dateStr.split('T')[0];

      // Handle MM/DD/YY
      // Example: 01/27/26 -> 2026-01-27
      const parts = dateStr.split('/');
      if (parts.length === 3) {
          const m = parts[0];
          const d = parts[1];
          let y = parts[2];
          
          if (y.length === 2) {
              // Assume 20xx
              y = "20" + y; 
          }
          return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      return dateStr;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.accessToken) {
          navigate("/");
          return;
        }

        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        const result = await response.json();
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
      } catch {
        toast.error("Failed to fetch profile details.");
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

      const response = await fetch("/api/auth/updateprofile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        // Update local storage profile
        const updatedProfile = { ...profile };
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        navigate("/app");
      } else {
        throw new Error(result.message || result.Message);
      }
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
    <div className="min-h-screen bg-gray-50 py-2 px-2">
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg border border-gray-100">


        <form onSubmit={handleSubmit} className="p-8" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Details */}
            <div className="col-span-full border-b pb-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-700">Personal Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={profile.firstName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-gray-100"
                readOnly 
                title="Cannot be modified"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={profile.middleName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-gray-100"
                readOnly
                 title="Cannot be modified"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={profile.lastName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-gray-100"
                 readOnly
                  title="Cannot be modified"
              />
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input
                type="text"
                name="idNumber"
                value={profile.idNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-gray-100"
                readOnly
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={profile.emailAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-brand-brown-600">*</span></label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none"
                required
              />
              {renderError("phoneNumber")}
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-brand-brown-600">*</span></label>
              <input
                type="date"
                name="birthDate"
                value={profile.birthDate || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none"
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              />
              {renderError("birthDate")}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-brand-brown-600">*</span></label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-white"
                required
              >
                  <option value="">Select Gender</option>
                  {GenderOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              {renderError("gender")}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none bg-white"
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
             <div className="col-span-full border-b pb-2 mb-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Contact & Location</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address <span className="text-brand-brown-600">*</span></label>
              <input
                type="text"
                name="postalAddress"
                value={profile.postalAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-green focus:outline-none"
                required
              />
              {renderError("postalAddress")}
            </div>

          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="btn-primary px-8 py-3 rounded-lg shadow-md hover:opacity-90 transition-colors font-semibold flex items-center gap-2"
              disabled={loading}
            >
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
