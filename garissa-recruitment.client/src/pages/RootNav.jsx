import logo from "../assets/images/logo.png";
import { useModal } from "../context/ModalContext";

const RootNav = () => {
  const { openLogin, openSignUp } = useModal();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-gold" aria-hidden="true" />
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:px-10">
        <img src={logo} alt="Garissa University logo" className="h-9 w-auto sm:h-12 md:h-14" />
        <div className="flex gap-2 sm:gap-3">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-green hover:bg-brand-green-50 hover:text-brand-green-700"
            onClick={openLogin}
          >
            Login
          </button>
          <button
            className="btn-primary rounded-lg px-4 py-2 text-sm"
            onClick={openSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default RootNav;
