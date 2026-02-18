import { useLocation, useNavigate } from "react-router-dom";
import { 
  IconMenu2, 
  IconBell, 
  IconChevronDown, 
  IconUserCircle,
  IconSettings,
  IconLogout
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profile] = useState(() => {
    const stored = localStorage.getItem("userProfile");
    return stored ? JSON.parse(stored) : null;
  });
  const dropdownRef = useRef(null);

  const getValue = (val) => {
    if (Array.isArray(val)) {
      return val.length > 0 ? val[0] : "";
    }
    return val || "";
  };

  const getDisplayName = () => {
    if (!profile) return "User Account";
    const first = getValue(profile.FirstName);
    const last = getValue(profile.LastName);
    if (!first && !last) return "User Account";
    return `${first} ${last}`.trim();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    navigate("/");
  };

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    return (
      <div className="flex items-center text-sm text-slate-500 font-medium overflow-hidden whitespace-nowrap">
        <span className="hover:text-cyan-600 transition-colors cursor-default capitalize">Home</span>
        {pathnames.map((value) => {
          // Skip 'app' in breadcrumbs to be cleaner
          if (value === "app") return null;
          
          return (
            <div key={value} className="flex items-center">
              <span className="mx-2 text-slate-300">/</span>
              <span className="hover:text-cyan-600 transition-colors cursor-default capitalize">
                {value.replace(/-/g, " ")}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shadow-slate-100/50">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
        >
          <IconMenu2 size={24} />
        </button>

        {/* Breadcrumbs */}
        <div className="hidden sm:block">
          {generateBreadcrumbs()}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all relative">
          <IconBell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>

        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-full transition-all border border-transparent hover:border-slate-100"
          >
            <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 p-0.5 rounded-full">
              <IconUserCircle className="text-white bg-white/20 rounded-full" size={32} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                {getDisplayName()}
              </p>
              <p className="text-xs text-slate-500">Applicant</p>
            </div>
            <IconChevronDown size={14} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Minimal Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <button 
                onClick={() => { navigate("/app/profile"); setShowProfileMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              >
                <IconUserCircle size={18} className="text-slate-400" /> My Profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
              onClick={() => { navigate("/app/settings"); setShowProfileMenu(false); }}>
                <IconSettings size={18} className="text-slate-400" /> Account Settings
              </button>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <IconLogout size={18} className="text-red-400" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
