import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaUserPlus,
  FaArrowLeft,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { changeDocumentTitle } from "../scripts/script";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [telNo, setTelNo] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const requestLink = window.location.origin;

  const handleSubmit = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);
      const newObj = {
        firstName,
        middleName,
        lastName,
        idNumber,
        telNo,
        emailAddress,
        requestLink,
      };

      const response = await fetch("/api/auth/createaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj),
      });

      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      navigate("/account");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    changeDocumentTitle("Create Account");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      {/* Registration Card */}
      <div className="bg-white/80 shadow-2xl rounded-3xl overflow-hidden w-full max-w-4xl p-8 md:p-12 border border-gray-100 animate-in fade-in zoom-in duration-500">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-gray-50">
            <img
              src={logo}
              alt="KUCCPS Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center">
            <h2 className="text-gray-900 font-black text-2xl md:text-3xl tracking-tight flex items-center justify-center gap-3">
              <FaUserPlus className="text-red-600 text-xl md:text-2xl" />
              Create Account
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium mt-1">
              Join the KUCCPS Recruitment Portal
            </p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Section: Personal Names */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                Personal Information
              </p>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="First Name"
                id="first-name"
                icon={<FaUser />}
                placeholder="First"
                value={firstName}
                onChange={setFirstName}
                required
              />
              <InputField
                label="Middle Name"
                id="middle-name"
                icon={<FaUser />}
                placeholder="Middle"
                value={middleName}
                onChange={setMiddleName}
              />
              <InputField
                label="Last Name"
                id="last-name"
                icon={<FaUser />}
                placeholder="Last"
                value={lastName}
                onChange={setLastName}
                required
              />
            </div>
          </div>

          {/* Section: Identification & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                Contact & Identity
              </p>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="ID / Passport Number"
                id="id-number"
                icon={<FaIdCard />}
                placeholder="12345678"
                value={idNumber}
                onChange={setIdNumber}
                required
              />
              <InputField
                label="Telephone Number"
                id="phone"
                icon={<FaPhone />}
                placeholder="0712 345 678"
                type="text"
                value={telNo}
                onChange={setTelNo}
                required
              />
            </div>
          </div>

          {/* Section: Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-[1px] flex-1 bg-gray-100"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
                Login Credentials
              </p>
              <div className="h-[1px] flex-1 bg-gray-100"></div>
            </div>
            <InputField
              label="Email Address"
              id="email"
              icon={<FaEnvelope />}
              placeholder="name@example.com"
              type="email"
              value={emailAddress}
              onChange={setEmailAddress}
              required
            />
          </div>

          {/* Register Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-xl shadow-red-200 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">
            Already have an account?{" "}
            <Link
              to="/account"
              className="text-red-600 font-black hover:text-red-700 transition-colors ml-1"
            >
              Sign In
            </Link>
          </p>
          <Link
            to="/account"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            <FaArrowLeft className="text-[10px]" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

/* Reusable Professional Input Component */
const InputField = ({
  label,
  id,
  icon,
  placeholder,
  type = "text",
  value,
  onChange,
  required = false,
}) => (
  <div className="space-y-2">
    <label
      htmlFor={id}
      className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
    >
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
        {icon}
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-700 text-sm font-medium"
      />
    </div>
  </div>
);

export default CreateAccount;
