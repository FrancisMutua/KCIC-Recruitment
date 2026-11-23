import { Link, useNavigate } from "react-router-dom";
import { IconLayoutDashboard, IconLogin2, IconUserPlus } from "@tabler/icons-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../context/ModalContext";
import { isSignedIn } from "../lib/session";

const RootNav = () => {
  const { openLogin, openSignUp } = useModal();
  const navigate = useNavigate();
  const signedIn = isSignedIn();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-gold" aria-hidden="true" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8" aria-label="Main">
        <Link to="/" className="shrink-0" aria-label="Garissa University careers home">
          <img src={logo} alt="Garissa University — Oasis of Innovation" className="h-9 w-auto sm:h-12" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {signedIn ? (
            <button type="button" className="btn btn-primary" onClick={() => navigate("/app")}>
              <IconLayoutDashboard size={18} /> My dashboard
            </button>
          ) : (
            <>
              <button type="button" className="btn btn-ghost" onClick={openLogin}>
                <IconLogin2 size={18} /> <span>Sign in</span>
              </button>
              <button type="button" className="btn btn-primary" onClick={openSignUp}>
                <IconUserPlus size={18} className="hidden sm:block" /> Create account
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default RootNav;
