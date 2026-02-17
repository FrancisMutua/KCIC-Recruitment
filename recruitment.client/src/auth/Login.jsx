import { FaLock, FaEnvelope, FaKey, FaEye, FaEyeSlash } from "react-icons/fa"; // Added Eye icons
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { changeDocumentTitle } from "../scripts/script";

const Login = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New state for visibility
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);
      const newObj = { username: emailAddress, password };

      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj),
      });

      const result = await response.json();
      if (result.success === false) throw new Error(result.message);

      const token = result.accessToken;
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("accessToken", token);

      navigate("/app");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    changeDocumentTitle("Login");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 w-[30rem]">
      {/* Login Card - Removed hardcoded width for better responsiveness, used max-w-md */}
      <div className="bg-white/80 shadow-2xl rounded-3xl overflow-hidden w-full p-8 md:p-12 border border-gray-100">
        {/* Logo and Header Section */}
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
              <FaLock className="text-red-600 text-xl md:text-2xl" />
              User Login
            </h2>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">
              Recruitment Portal
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email-address"
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
            >
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                <FaEnvelope size={14} />
              </div>
              <input
                id="email-address"
                type="email"
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-700 text-sm font-medium"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label
                htmlFor="password"
                className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]"
              >
                Password
              </label>
              <Link
                to="/account/forgot-password"
                className="text-[10px] text-red-600 hover:text-red-700 font-black uppercase tracking-tighter transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                <FaKey size={14} />
              </div>
              <input
                id="password"
                // DYNAMIC TYPE TOGGLE
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-700 text-sm font-medium"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* SHOW/HIDE TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
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
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Registration Prompt */}
        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">
            New to the portal?{" "}
            <Link
              to="/account/create-account"
              className="text-red-600 font-black hover:text-red-700 transition-colors ml-1"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
