import logo from "../assets/images/logo.png";
import { useModal } from "../context/ModalContext";

const RootNav = () => {
  const { openLogin, openSignUp } = useModal();

  return (
    <>
      <nav className="flex justify-between items-center border-b-2 border-b-cyan-400 py-2 px-6 md:py-4 md:px-20 bg-white">
        <img src={logo} alt="Biovax Logo" className="w-[40%] md:w-72" />
        <div className="flex gap-5">
          <button
            className="py-2 px-4 rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 text-white font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            onClick={openLogin}
          >
            Login
          </button>
          <button
            className="py-2 px-4 rounded-md bg-white border border-cyan-500 text-cyan-600 font-medium hover:bg-cyan-50 transition-all"
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
