import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBriefcase,
  FaQuestionCircle,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const RootNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Refined Active Link Styling (Text-sm is industry standard for Navbars)
  const navLinkStyles = ({ isActive }) =>
    `relative py-1 transition-all duration-300 font-bold text-sm flex items-center gap-2 ${
      isActive
        ? "text-red-600 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-red-600 after:rounded-full"
        : "text-gray-600 hover:text-red-600"
    }`;

  return (
    <nav
      className={`sticky top-0 w-full z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2"
          : "bg-white py-4 md:border-b md:border-gray-100"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 flex justify-between items-center">
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <img
              src={logo}
              alt="KUCCPS Logo"
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 rounded-full border border-red-600/10 group-hover:border-red-600 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg md:text-xl tracking-tighter text-primary leading-tight">
              KUCCPS
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
              Career Portal
            </span>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <ul className="hidden md:flex items-center gap-8">
          <li>
            <NavLink to="vacancies" className={navLinkStyles}>
              <FaBriefcase className="text-xs" /> Vacancies
            </NavLink>
          </li>
          <li>
            <NavLink to="help" className={navLinkStyles}>
              <FaQuestionCircle className="text-xs" /> How to Apply
            </NavLink>
          </li>
          <li>
            <NavLink to="account" className={navLinkStyles}>
              Login
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/account/create-account"
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-700 hover:shadow-lg hover:shadow-red-900/20 transition-all active:scale-95"
            >
              Create Account
            </NavLink>
          </li>
        </ul>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      />

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-white p-6 shadow-2xl transform transition-transform duration-500 ease-out md:hidden z-[900] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-8 h-8" />
            <span className="font-black text-lg text-primary">KUCCPS</span>
          </div>
          <button
            onClick={toggleMenu}
            className="p-2 bg-gray-50 rounded-full text-gray-400"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black mb-2 px-4">
            Navigation
          </p>
          <MobileLink
            to="vacancies"
            icon={<FaBriefcase />}
            label="Vacancies"
            onClick={toggleMenu}
          />
          <MobileLink
            to="help"
            icon={<FaQuestionCircle />}
            label="How to Apply"
            onClick={toggleMenu}
          />

          <div className="my-4 border-t border-gray-50" />

          <MobileLink
            to="account"
            icon={<FaUserCircle />}
            label="Sign In"
            onClick={toggleMenu}
          />

          <li className="mt-4 px-2">
            <NavLink
              to="/account/create-account"
              onClick={toggleMenu}
              className="block w-full text-center bg-red-600 text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-red-900/10"
            >
              Create Account
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

const MobileLink = ({ to, icon, label, onClick }) => (
  <li>
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-bold transition-all ${
          isActive ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-50"
        }`
      }
    >
      <span className="text-lg opacity-70">{icon}</span>
      {label}
    </NavLink>
  </li>
);

export default RootNav;
