import { useState } from "react";
import { toast } from "react-toastify";

const Settings = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: ""
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (passwords.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch("/api/auth/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(passwords),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        setPasswords({ currentPassword: "", newPassword: "" });
        setIsChangePasswordOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("An error occurred while changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Account Settings</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
        
        {/* Change Password Section */}
        <div className="group transition-colors">
          <div 
            className="p-6 flex justify-between items-center cursor-pointer hover:bg-slate-50"
            onClick={() => setIsChangePasswordOpen(!isChangePasswordOpen)}
          >
            <div>
              <h4 className="font-semibold text-slate-800">Change Password</h4>
              <p className="text-sm text-slate-500 mt-1">Update your login credentials</p>
            </div>
            <div className={`text-slate-300 group-hover:text-brand-navy transition-transform duration-300 ${isChangePasswordOpen ? 'rotate-180' : ''}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Collapsible Form */}
          <div className={`overflow-hidden transition-all duration-300 ${isChangePasswordOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <form onSubmit={handleChangePassword} className="p-6 pt-0 space-y-4">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-navy"
                  >
                    {showCurrentPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-eye-off" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                         <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                         <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                         <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 3.145 -3.597 5.253 -4.398" />
                         <path d="M9.893 21h0" />
                         <path d="M19.117 19.123l-16.234 -16.248" />
                         <path d="M22 12c-1.5 2 -3.493 3.51 -5.319 4.316" />
                         <path d="M17.8 7.39c1.99 .77 3.57 2.15 4.2 4.61" />
                       </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-eye" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                         <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                         <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                         <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-brand-navy"
                  >
                     {showNewPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-eye-off" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                         <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                         <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                         <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 3.145 -3.597 5.253 -4.398" />
                         <path d="M9.893 21h0" />
                         <path d="M19.117 19.123l-16.234 -16.248" />
                         <path d="M22 12c-1.5 2 -3.493 3.51 -5.319 4.316" />
                         <path d="M17.8 7.39c1.99 .77 3.57 2.15 4.2 4.61" />
                       </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-eye" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                         <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                         <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                         <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                    </>
                  ) : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
