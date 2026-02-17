import { FaUserCircle } from "react-icons/fa";
import { useAccountDetails } from "../hooks/useAccountDetails";
import { useEffect, useState } from "react";

const General = () => {
  const { account, isLoading } = useAccountDetails();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");

  const handleSubmit = function (e) {
    e.preventDefault();
    // Handle save logic
  };

  useEffect(
    function () {
      if (!isLoading && account) {
        /* eslint-disable */
        setFirstName(account.firstName || "");
        setMiddleName(account.middleName || "");
        setLastName(account.lastName || "");
        setEmailAddress(account.emailAddress || "");
        setPhoneNumber(account.telephoneNo || "");
        setIdNumber(account.idNumber || "");
      }
    },
    [account, isLoading],
  );

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Profile Picture Section */}
      <div className="flex flex-col md:flex-row items-center gap-6 pb-8 border-b border-gray-100">
        <div className="relative group">
          <div className="text-blue-600 bg-blue-50 rounded-full p-1 border-2 border-white shadow-lg">
            <FaUserCircle size={80} className="md:w-24 md:h-24" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight">
            Account Information
          </h3>
          <p className="text-gray-400 text-xs mt-1 font-medium">
            Update your basic profile details and contact information.
          </p>
        </div>
      </div>

      {/* Form Grid */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5"
        onSubmit={handleSubmit}
      >
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            First Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            placeholder="e.g. John"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Middle Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            placeholder="Optional"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Last Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            required
            placeholder="e.g. Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Email Address (Verified)
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-gray-500 text-sm cursor-not-allowed"
            readOnly
            value={emailAddress}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Phone Number
          </label>
          <input
            type="tel"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            placeholder="e.g. 0712345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            ID / Passport Number
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            placeholder="Identification Number"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
          />
        </div>

        <div className="md:col-span-2 pt-6">
          <button className="bg-[#00171f] text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default General;
