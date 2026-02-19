import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../components/ui/GlobalDropdown";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [profile, setProfile] = useState({
    emailAddress: "",
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    initials: "",
    phoneNumber: "",
    gender: "",
    maritalStatus: "",
    postalCode: "",
    postalAddress: "",
    birthDate: "",
    disability: "false",
    disabilityStatus: "",
    pwdNumber: "",
    country: "",
    wardCode: "",
  });



  // Helper to map text marital status to value
  const getMaritalStatusValue = (status) => {
    if (!status) return "";
    const map = {
      "Single": "0",
      "Married": "1",
      "Separated": "2",
      "Divorced": "3",
      "Widow(er)": "4",
      "Widowed": "4",
      "Other": "5"
    };
    return map[status] || "";
  };
  
  // Helper to map gender text to value (assuming text comes back)
  const getGenderValue = (gender) => {
      if(!gender || gender.trim() === "") return "";
      if(gender.toLowerCase() === "female") return "1";
      if(gender.toLowerCase() === "male") return "2";
      return "";
  }

  // Helper to map Initials text to value
  const getInitialsValue = (initials) => {
      if(!initials) return "";
      const map = {
          "Mr.": "0", "Mr": "0",
          "Miss.": "1", "Miss": "1",
          "Mrs.": "2", "Mrs": "2",
          "Dr.": "3", "Dr": "3", // Assuming Dr might exist, if not purely strict
          "Prof.": "4", "Prof": "4"
      };
      return map[initials] || map[initials.trim()] || "";
  };

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
          return `${y}-${m}-${d}`;
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
            postalCode: d.PostCode || prev.postalCode,
            postalAddress: d.PostalAddress || prev.postalAddress,
            birthDate: formatNavDate(d.DateOfBirth) || prev.birthDate,
            
            // Map Dropdowns if text is returned
            maritalStatus: getMaritalStatusValue(d.MaritalStatus) || prev.maritalStatus,
            gender: getGenderValue(d.Gender) || prev.gender,
            initials: getInitialsValue(d.Initials) || prev.initials,
            
            // Other fields not in the snippet but strictly mapped
            country: d.Country || prev.country,
            disability: d.Disability ? String(d.Disability).toLowerCase() : prev.disability,
            disabilityStatus: d.DisabilityStatus || prev.disabilityStatus,
            pwdNumber: d.PwdNumber || prev.pwdNumber,
            wardCode: d.WardCode || prev.wardCode
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
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Age (18+)
    if (profile.birthDate) {
      const dob = new Date(profile.birthDate);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        toast.error("You must be at least 18 years old to update your profile.");
        return;
      }
    }

    setLoading(true);
    try {
        const user = JSON.parse(localStorage.getItem("user"));
        
        // Convert types for backend
        const payload = {
            ...profile,
            initials: parseInt(profile.initials) || 0,
            gender: parseInt(profile.gender) || 0,
            maritalStatus: parseInt(profile.maritalStatus) || 0,
            disability: profile.disability === "true" || profile.disability === true,
            phoneNumber: String(profile.phoneNumber || ""), // Ensure string type
             // Ensure date string is valid or null if empty
            birthDate: profile.birthDate ? profile.birthDate : null
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
        <IconLoader2 className="animate-spin text-brand-navy" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-2 px-2">
      <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg border border-gray-100">


        <form onSubmit={handleSubmit} className="p-8">
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-gray-100"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-gray-100"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-gray-100"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-gray-100"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-gray-100"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initials <span className="text-red-500">*</span></label>
              <select
                name="initials"
                value={profile.initials}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-white"
                required
              >
                  <option value="">Select Initials</option>
                  <option value="0">Mr.</option>
                  <option value="1">Miss.</option>
                  <option value="2">Mrs.</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                required
              />
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="birthDate"
                value={profile.birthDate || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-white"
                required
              >
                  <option value="">Select Gender</option>
                  <option value="1">Female</option>
                  <option value="2">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status <span className="text-red-500">*</span></label>
               <select
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-white"
                required
              >
                  <option value="">Select Marital Status</option>
                  <option value="0">Single</option>
                  <option value="1">Married</option>
                  <option value="2">Separated</option>
                  <option value="3">Divorced</option>
                  <option value="4">Widow(er)</option>
                  <option value="5">Other</option>
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
              />
            </div>

            {/* Address & Contact */}
             <div className="col-span-full border-b pb-2 mb-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Contact & Location</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="postalAddress"
                value={profile.postalAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="postalCode"
                value={profile.postalCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                required
              />
            </div>
            

             {/* Other Details */}
            <div className="col-span-full border-b pb-2 mb-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-700">Other Details</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disability</label>
               <select
                name="disability"
                value={profile.disability}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none bg-white"
              >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
              </select>
            </div>

             {(profile.disability === "true" || profile.disability === true) && (
                <>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PWD Number <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="pwdNumber"
                    value={profile.pwdNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    required
                />
                </div>
                <div>
                <GlobalDropdown
                    source="SOAP"
                    type="Disability Type"
                    label="Disability Type"
                    name="disabilityStatus"
                    value={profile.disabilityStatus}
                    onChange={(val) => handleChange({ target: { name: "disabilityStatus", value: val } })}
                    required
                />
                </div>
                </>
            )}

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
