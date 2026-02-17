import { NavLink, useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaUser,
  FaSignOutAlt,
  FaTimes,
  FaHome,
  FaQuestionCircle,
  FaHistory,
  FaEdit,
  FaFileSignature,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { useAccount } from "../context/AccountContext";

const links = [
  { name: "Dashboard", path: "/app/dashboard", icon: <FaHome /> },
  { name: "Vacancies", path: "/app/vacancies", icon: <FaBriefcase /> },
  { name: "Profile Settings", path: "/app/profile", icon: <FaUser /> },
  {
    name: "Application Drafts",
    path: "/app/pending-applications",
    icon: <FaEdit />,
  },
  {
    name: "Track Applications",
    path: "/app/submitted-applications",
    icon: <FaHistory />,
  },
  {
    name: "Recomendations",
    path: "/app/recomendations",
    icon: <FaFileSignature />,
  },
  { name: "Help Center", path: "/app/help", icon: <FaQuestionCircle /> },
];

const SideNav = ({ isOpen, toggleSideNav }) => {
  const navigate = useNavigate();
  const { handleLogout } = useAccount();

  const activeLink = "bg-red-600 text-white shadow-lg shadow-red-600/30";
  const normalLink = `
    text-gray-600 dark:text-gray-400 lg:text-gray-400 
    hover:bg-red-600/10 hover:text-red-600 
    transition-all duration-300 ease-in-out
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={toggleSideNav}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-500 ease-in-out transform 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 w-72 flex flex-col shadow-2xl
        bg-white/90 backdrop-blur-xl border-r border-gray-100
        lg:bg-primary lg:backdrop-blur-none lg:border-white/5 
        dark:bg-primary dark:border-white/5`}
      >
        {/* 1. BRANDING SECTION */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <img
                src={logo}
                alt="Logo"
                className="w-10 h-10 md:w-12 md:h-12 drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-gray-800 lg:text-white uppercase leading-none">
                KUCCPS
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                Portal
              </span>
            </div>
          </div>
          <button
            onClick={toggleSideNav}
            className="lg:hidden p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-red-600 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="px-6">
          <hr className="border-gray-800/10 lg:border-white/10" />
        </div>

        {/* 2. NAVIGATION LINKS */}
        <nav className="mt-8 px-4 flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <p className="px-4 text-[10px] uppercase tracking-[0.25em] text-gray-400 font-black mb-2 opacity-70">
            Main Navigation
          </p>

          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => window.innerWidth < 1024 && toggleSideNav()}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive ? activeLink : normalLink
                }`
              }
            >
              <span className="text-lg opacity-80">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* 3. LOGOUT SECTION */}
        <div className="p-4 mt-auto">
          <div className="bg-gray-50 lg:bg-white/5 rounded-2xl p-1.5 border border-gray-100 lg:border-white/5">
            <button
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300
              text-red-600 lg:text-red-400 hover:bg-red-600 hover:text-white group"
              onClick={() => {
                handleLogout();
                navigate("/");
              }}
            >
              <FaSignOutAlt className="text-lg group-hover:scale-110 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNav;
