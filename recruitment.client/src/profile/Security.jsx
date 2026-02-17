import { FaShieldAlt } from "react-icons/fa";

const Security = () => {
  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
          <FaShieldAlt size={20} />
        </div>
        <div>
          <h3 className="text-base md:text-lg font-black text-[#00171f] uppercase tracking-tight">
            Security Settings
          </h3>
          <p className="text-gray-400 text-xs md:text-sm font-medium mt-0.5">
            Manage your credentials and maintain account integrity.
          </p>
        </div>
      </div>

      <form className="space-y-6 max-w-xl">
        {/* Current Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
            Current Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
          />
        </div>

        {/* New Passwords Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm"
            />
          </div>
        </div>

        {/* Security Requirements Info Box */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-700 mb-2.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Password Requirements
          </h4>
          <ul className="text-xs text-blue-800/70 space-y-1.5 font-medium">
            <li className="flex items-center gap-2">
              • Minimum 8 characters long
            </li>
            <li className="flex items-center gap-2">
              • Include at least one uppercase character
            </li>
            <li className="flex items-center gap-2">
              • Include at least one numeric and special character
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button className="bg-red-600 text-white px-10 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg active:scale-95 shadow-red-200">
            Update Credentials
          </button>
        </div>
      </form>
    </div>
  );
};

export default Security;
