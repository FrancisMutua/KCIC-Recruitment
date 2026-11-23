import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IconMenu2, IconChevronDown, IconUserCircle, IconSettings, IconLogout, IconSearch } from "@tabler/icons-react";
import { displayName, getProfile, initials, signOut } from "../../lib/session";

const TITLES = [
  ["/app/application-details", "Application"],
  ["/app/job-details", "Job details"],
  ["/app/applications", "My applications"],
  ["/app/profile-update", "Update profile"],
  ["/app/profile", "My profile"],
  ["/app/settings", "Account settings"],
  ["/app/jobs", "Open positions"],
  ["/app", "Dashboard"],
];

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const profile = getProfile();
  const name = displayName(profile) || "Applicant";
  const email = (Array.isArray(profile?.EmailAddress) ? profile.EmailAddress[0] : profile?.EmailAddress) || "";
  const title = TITLES.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] || "Recruitment portal";

  useEffect(() => {
    const onDown = (e) => menuRef.current && !menuRef.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  const go = (path) => { setOpen(false); navigate(path); };
  const logout = () => { setOpen(false); signOut(); navigate("/"); };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenuClick} className="btn btn-ghost p-2 lg:hidden" aria-label="Open menu"><IconMenu2 size={22} /></button>
        <p className="truncate text-base font-semibold text-slate-900 lg:text-lg">{title}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/app/jobs" onClick={() => setOpen(false)} className="btn btn-outline hidden sm:inline-flex"><IconSearch size={16} /> Find jobs</Link>
        <div className="relative" ref={menuRef}>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-transparent p-1 pr-2 transition hover:border-slate-200 hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-white">{initials(profile)}</span>
            <span className="hidden text-left md:block">
              <span className="block max-w-[12rem] truncate text-sm font-semibold text-slate-900">{name}</span>
              <span className="block text-xs text-slate-500">Applicant</span>
            </span>
            <IconChevronDown size={16} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div role="menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
                {email && <p className="truncate text-xs text-slate-500">{email}</p>}
              </div>
              <div className="p-1.5">
                <button role="menuitem" type="button" onClick={() => go("/app/profile")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><IconUserCircle size={18} className="text-slate-400" /> My profile</button>
                <button role="menuitem" type="button" onClick={() => go("/app/settings")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><IconSettings size={18} className="text-slate-400" /> Account settings</button>
                <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-brown-700 hover:bg-brand-brown-50"><IconLogout size={18} /> Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
