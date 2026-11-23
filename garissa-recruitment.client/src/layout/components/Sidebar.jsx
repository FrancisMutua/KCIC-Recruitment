import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { IconLayoutDashboard, IconBriefcase, IconUser, IconSettings, IconLogout, IconX, IconSearch } from "@tabler/icons-react";
import logo from "../../assets/images/logo.png";
import { signOut } from "../../lib/session";

const MENU = [
  { name: "Dashboard", path: "/app", icon: IconLayoutDashboard, end: true },
  { name: "Open positions", path: "/app/jobs", icon: IconSearch, match: ["/app/job-details"] },
  { name: "My applications", path: "/app/applications", icon: IconBriefcase, match: ["/app/application-details"] },
  { name: "My profile", path: "/app/profile", icon: IconUser, match: ["/app/profile-update"] },
  { name: "Account settings", path: "/app/settings", icon: IconSettings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => { signOut(); navigate("/"); };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Applicant navigation"
      >
        <div className="h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-gold" aria-hidden="true" />
        <div className="flex h-20 items-center justify-between gap-2 border-b border-slate-100 px-5">
          <img src={logo} alt="Garissa University" className="h-10 w-auto" />
          <button type="button" className="btn btn-ghost p-2 lg:hidden" onClick={onClose} aria-label="Close menu"><IconX size={20} /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {MENU.map(({ name, path, icon, end, match = [] }) => {
            const Icon = icon;
            const alsoActive = match.some((prefix) => location.pathname.startsWith(prefix));
            return (
              <NavLink key={path} to={path} end={end} onClick={onClose}
                className={({ isActive }) => `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive || alsoActive ? "bg-brand-green-50 text-brand-green-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
                {({ isActive }) => (
                  <>
                    <span className={`h-5 w-1 rounded-full ${isActive || alsoActive ? "bg-brand-green" : "bg-transparent"}`} aria-hidden="true" />
                    <Icon size={20} className={isActive || alsoActive ? "text-brand-green-600" : "text-slate-400 group-hover:text-slate-600"} />
                    {name}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-brown-50 hover:text-brand-brown-700">
            <span className="w-1" aria-hidden="true" />
            <IconLogout size={20} className="text-slate-400" /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
