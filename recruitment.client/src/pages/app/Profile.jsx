import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GenderOptions, MaritalStatusOptions } from "../../constants/enums";

const Profile = () => {
  const navigate = useNavigate();
  const [profile] = useState(() => {
    const stored = localStorage.getItem("userProfile");
    return stored ? JSON.parse(stored) : null;
  });

  const getValue = (val) => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val[0] : "";
    }
    return val || "";
  };

  const getInitials = () => {
    if (!profile) return "UA";
    const firstName = getValue(profile.FirstName);
    const lastName = getValue(profile.LastName);
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "UA";
  };


  const getGenderLabel = (val) => {
    if (!val && val !== 0) return "";
    // Check if it's already a label
    if (isNaN(val)) return val; 
    const option = GenderOptions.find(o => o.value == val);
    return option ? option.label : val;
  };

  const getMaritalStatusLabel = (val) => {
    if (!val && val !== 0) return "";
    // Check if it's already a label
    if (isNaN(val)) return val;
    const option = MaritalStatusOptions.find(o => o.value == val);
    return option ? option.label : val;
  };

  return (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <div className="w-32 h-32 bg-cyan-100 rounded-full mx-auto mb-4 border-4 border-cyan-50 flex items-center justify-center text-cyan-600 text-4xl font-bold">
            {getInitials()}
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            {profile ? `${getValue(profile.FirstName)} ${getValue(profile.LastName)}` : "User Account"}
          </h3>
          <p className="text-slate-500">Applicant</p>
          <button className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-all">
            Edit Photo
          </button>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">First Name</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getValue(profile?.FirstName) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">Last Name</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getValue(profile?.LastName) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">Email Address</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getValue(profile?.EmailAddress) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">Phone Number</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getValue(profile?.TelephoneNo) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">Marital Status</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getMaritalStatusLabel(getValue(profile?.MaritalStatus)) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1 capitalize">Gender</label>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-100">
                  {getGenderLabel(getValue(profile?.Gender)) || <span className="italic text-slate-400">No data</span>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button className="bg-cyan-600 text-white px-10 py-3 rounded-xl font-semibold hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-600/20" onClick={() => navigate('/app/profile-update')}>
              Update Profile
            </button>
          </div>
        </div>
      </div>
  );
};

export default Profile;
