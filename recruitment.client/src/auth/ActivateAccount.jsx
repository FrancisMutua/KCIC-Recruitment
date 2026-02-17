import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaLock, FaKey, FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import logo from "../assets/logo.png";
import { changeDocumentTitle } from "../scripts/script";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const emailAddress = searchParams.get("emailAddress");
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const activateUserAccount = async function () {
      try {
        const response = await fetch(
          `/api/auth/activateaccount?token=${token}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        const result = await response.json();
        if (result.success === false) throw new Error(result.message);

        toast.success(
          "Account verified successfully! Please set your password.",
        );
      } catch (error) {
        toast.error(error.message);
      }
    };
    if (token) activateUserAccount();
  }, [token]);

  const handleSubmit = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);

      if (password !== confirmPassword)
        throw new Error("Passwords do not match");
      if (password.length < 8)
        throw new Error("Password must be at least 8 characters");

      const newObj = { emailAddress, password };

      const response = await fetch("/api/auth/updatepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newObj),
      });

      const result = await response.json();
      if (result.success === false) throw new Error(result.message);

      toast.success("Security credentials updated. You can now login.");
      navigate("/account");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    changeDocumentTitle("Activate Account");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 w-[30rem]">
      {/* Card Container */}
      <div className="bg-white/80 shadow-2xl rounded-3xl overflow-hidden w-full p-8 md:p-12 border border-gray-100 animate-in fade-in zoom-in duration-500">
        {/* Header Section */}
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
              <FaShieldAlt className="text-red-600 text-xl" />
              Update Security
            </h2>
            <p className="text-gray-400 text-sm md:text-base font-medium mt-2 leading-relaxed px-4">
              Account verified for <br />
              <span className="text-gray-700 font-bold">{emailAddress}</span>
            </p>
          </div>
        </div>

        {/* Form Section */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* --- New Password Field --- */}
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
            >
              New Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                <FaLock size={14} />
              </div>
              <input
                id="new-password"
                // DYNAMIC TYPE HERE
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-700 text-sm font-medium"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* --- Confirm Password Field --- */}
          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1"
            >
              Confirm Password
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-red-600">
                <FaKey size={14} />
              </div>
              <input
                id="confirm-password"
                // DYNAMIC TYPE HERE
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all text-gray-700 text-sm font-medium"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* --- Professional Show Password Checkbox --- */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                <div
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${showPassword ? "bg-red-600 border-red-600" : "bg-white border-gray-300"}`}
                >
                  {showPassword && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest select-none group-hover:text-red-600 transition-colors">
                  Show Passwords
                </span>
              </div>

              <p className="text-[10px] text-gray-400 italic font-bold">
                * Min. 8 characters
              </p>
            </div>
          </div>

          {/* Update Button */}
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
                "Update Password"
              )}
            </button>
          </div>
        </form>

        {/* Footer Navigation */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
          <Link
            to="/account"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-red-600 transition-colors group"
          >
            <FaArrowLeft className="text-[10px] transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
