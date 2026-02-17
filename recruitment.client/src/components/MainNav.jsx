import { useState } from "react";
import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import { MdOutlineSettings, MdHelpOutline } from "react-icons/md";
import { IoNotificationsOutline, IoSearchOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useAccountDetails } from "../hooks/useAccountDetails";
import { useAccount } from "../context/AccountContext";

const MainNav = ({ toggleSideNav }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { account } = useAccountDetails();
  const { handleLogout } = useAccount();

  const navHoverStyle =
    "hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-in-out";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-2.5 flex justify-between items-center shadow-sm">
      {/* Left: Mobile Menu Toggle & Page Context */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSideNav}
          className="lg:hidden text-gray-500 p-2 hover:bg-gray-50 rounded-xl transition-all"
        >
          <FaBars size={18} />
        </button>
        <div className="hidden md:block">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-1">
            Recruitment
          </p>
          <p className="text-sm font-black text-gray-800 tracking-tight">
            Management System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-1 mr-2">
          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <IoSearchOutline size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all relative">
            <IoNotificationsOutline size={20} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-600 border border-white rounded-full"></span>
          </button>
        </div>

        {/* User Profile Trigger */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm rounded-xl transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-gray-900 leading-tight">
                {account?.firstName} {account?.lastName}
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-black">
                Applicant
              </p>
            </div>
            <div className="text-blue-600 bg-blue-50 rounded-full border border-blue-100 group-hover:scale-105 transition-transform">
              <FaUserCircle size={28} />
            </div>
            <FaChevronDown
              className={`text-gray-300 text-xs transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Styled Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 md:w-80 p-5 bg-white border border-gray-100 shadow-2xl rounded-[1.5rem] animate-in fade-in zoom-in-95 duration-200 z-50">
              {/* 1. Profile Header */}
              <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-gray-50">
                <div className="relative mb-3">
                  <div className="text-blue-600 bg-blue-50 rounded-full p-1 border-2 border-white shadow-md">
                    <FaUserCircle size={56} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {account?.firstName} {account?.middleName} {account?.lastName}
                </h3>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                  Portal User
                </p>
              </div>

              {/* 2. List Items */}
              <div className="space-y-1 mb-5">
                <Link
                  to="/app/profile"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 ${navHoverStyle}`}
                >
                  <MdOutlineSettings size={18} className="opacity-70" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/app/help"
                  onClick={() => setDropdownOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 ${navHoverStyle}`}
                >
                  <MdHelpOutline size={18} className="opacity-70" />
                  <span>Help Center</span>
                </Link>
              </div>

              {/* 3. Logout Button */}
              <div className="pt-4 border-t border-gray-50">
                <button
                  className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-black text-sm
                  text-red-600 shadow-sm border border-red-50 transition-all duration-300 hover:bg-red-600 hover:text-white group`}
                  onClick={() => {
                    handleLogout();
                    navigate("/");
                  }}
                >
                  <span>Sign Out</span>
                  <FaSignOutAlt
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default MainNav;
