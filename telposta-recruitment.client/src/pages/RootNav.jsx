import logo from "../assets/images/logo.svg";
import { useModal } from "../context/ModalContext";

const RootNav = () => {
  const { openLogin, openSignUp } = useModal();

  return (
    <>
      <nav className="flex justify-between items-center border-b-2 border-b-brand-green py-2 md:py-1 md:px-20 bg-white">
        <img src={logo} alt="TelPosta Pension Scheme logo" className="h-14 w-auto md:h-16" />
        <div className="flex gap-5">
          <button
            className="py-2 px-4 rounded-md btn-primary font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            onClick={openLogin}
          >
            Login
          </button>
          <button
            className="py-2 px-4 rounded-md btn-secondary font-medium transition-all"
            onClick={openSignUp}
          >
            Sign Up
          </button>
        </div>
      </nav>
    </>
  );
};

export default RootNav;
