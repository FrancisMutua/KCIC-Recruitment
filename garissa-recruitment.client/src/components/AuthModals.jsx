import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  IconEye,
  IconEyeOff,
  IconId,
  IconLoader2,
  IconLock,
  IconMail,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../context/ModalContext";
import { apiFetch, readJson } from "../lib/http";

const AuthModals = () => {
  const {
    showModal,
    showLoginModal,
    showForgotPasswordModal,
    showCreateAccountModal,
    openLogin,
    openSignUp,
    openForgotPassword,
    closeModals,
  } = useModal();

  const [loading, setLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmitCreateAccount = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);

      // Check passwords
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }

      // Create then account object
      const user = {
        emailAddress,
        firstName,
        middleName,
        lastName,
        idNumber,
        password,
      };
      const response = await apiFetch("/api/auth/createaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const result = await readJson(response);
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      openLogin();
      setEmailAddress("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setIdNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);

      const user = { username: emailAddress, password };

      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const result = await readJson(response);

      if (result.success === false) throw new Error(result.message);

      const token = result.data;
      const isProfileUpdated = token.isProfileUpdated;

      // Fetch user profile details
      const profileResponse = await apiFetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      const profileResult = await profileResponse.json();

      localStorage.setItem("user", JSON.stringify(token));
      
      if (profileResult.success) {
        localStorage.setItem("userProfile", JSON.stringify(profileResult.data));
      }

      setEmailAddress("");
      setPassword("");

      closeModals();

      if (!isProfileUpdated) {
          navigate("/app/profile-update");
      } else {
          navigate("/app");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForgotPassword = async function (e) {
    e.preventDefault();
    try {
      setLoading(true);

      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please try again later!");
        return;
      }

      const user = { username: emailAddress, password };

      const response = await apiFetch("/api/auth/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const result = await readJson(response);

      if (result.success === false) throw new Error(result.message);

      toast.success(result.message);

      setEmailAddress("");
      setPassword("");
      setConfirmPassword("");
      openLogin();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showModal && (
        <div
          className="fixed top-0 left-0 w-full min-h-screen bg-slate-900/50 backdrop-blur-sm overflow-y-scroll z-50"
          onClick={closeModals}
        ></div>
      )}

      {/* Login functionality */}
      {showLoginModal && (
        <div className="z-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] backdrop-blur-2xl bg-white p-3 rounded-md w-[24rem] shadow-2xl border border-gray-200">
          <IconX
            className="cursor-pointer fixed right-3 text-gray-500 hover:text-brand-brown-600 transition-colors"
            onClick={closeModals}
          />
          <figure className="flex justify-center items-center">
            <img src={logo} alt="Garissa University logo" className="h-12 w-auto" />
          </figure>
          <h2 className="text-center font-semibold mt-2 mb-2 text-2xl text-brand-green-600">
            Login
          </h2>
          <form className="flex flex-col gap-5 px-4 pb-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email-address"
                className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
              >
                Email Address
              </label>
              <div className="relative">
                <IconMail
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                  size={20}
                />
                <input
                  type="text"
                  id="email-address"
                  className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Email Address"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
              >
                Password
              </label>
              <div className="relative">
                <IconLock
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                  size={20}
                />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  id="password"
                  className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-brand-green-600 transition-colors"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? (
                    <IconEyeOff size={20} />
                  ) : (
                    <IconEye size={20} />
                  )}
                </button>
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full btn-primary py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <IconLoader2 className="animate-spin" size={20} /> Signing In
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-2 items-center mt-2 text-sm text-gray-600">
            <p>
              Do not have an account?{" "}
              <button
                className="text-brand-green-600 font-semibold hover:underline"
                onClick={openSignUp}
              >
                Create an account
              </button>
            </p>
            <button
              className="text-brand-green-600 font-semibold hover:underline"
              onClick={openForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      )}

      {/* Forgot password functionality */}
      {showForgotPasswordModal && (
        <div className="z-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] backdrop-blur-2xl bg-white p-3 rounded-md w-[24rem] shadow-2xl border border-gray-200">
          <IconX
            className="cursor-pointer fixed right-3 text-gray-500 hover:text-brand-brown-600 transition-colors"
            onClick={closeModals}
          />
          <figure className="flex justify-center items-center">
            <img src={logo} alt="Garissa University logo" className="h-12 w-auto" />
          </figure>
          <h2 className="text-center font-semibold mt-2 mb-2 text-2xl text-brand-green-600">
            Forgot Password
          </h2>
          <form
            className="flex flex-col gap-5 px-4 pb-4"
            onSubmit={handleSubmitForgotPassword}
          >
            <div>
              <label
                htmlFor="email-address"
                className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
              >
                Email Address
              </label>
              <div className="relative">
                <IconMail
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                  size={20}
                />
                <input
                  type="text"
                  id="email-address"
                  className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Email Address"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
              >
                New Password
              </label>
              <div className="relative">
                <IconLock
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                  size={20}
                />
                <input
                  type="password"
                  id="password"
                  className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
              >
                Confirm Password
              </label>
              <div className="relative">
                <IconLock
                  className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                  size={20}
                />
                <input
                  type="password"
                  id="confirm-password"
                  className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full btn-primary py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <IconLoader2 className="animate-spin" size={20} /> Resetting
                    Password
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-2 items-center mt-2 text-sm text-gray-600">
            <button
              className="text-brand-brown-600 font-semibold hover:underline"
              onClick={openLogin}
            >
              Back to login
            </button>
          </div>
        </div>
      )}

      {/* Create account modal */}
      {showCreateAccountModal && (
        <div className="z-50 fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] backdrop-blur-2xl bg-white p-3 rounded-md w-[26rem] md:w-[50rem] shadow-2xl border border-gray-200">
          <IconX
            className="cursor-pointer fixed right-3 text-gray-500 hover:text-brand-brown-600 transition-colors"
            onClick={closeModals}
          />
          <figure className="flex justify-center items-center">
            <img src={logo} alt="Garissa University logo" className="h-12 w-auto" />
          </figure>
          <h2 className="text-center font-semibold mt-2 mb-2 text-2xl text-brand-green-600">
            Create Account
          </h2>
          <form onSubmit={handleSubmitCreateAccount} className="px-4 pb-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email-address"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Email Address
                </label>
                <div className="relative">
                  <IconMail
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="text"
                    id="email-address"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Email Address"
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="first-name"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  First Name
                </label>
                <div className="relative">
                  <IconUser
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="text"
                    id="first-name"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="middle-name"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Middle Name
                </label>
                <div className="relative">
                  <IconUser
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="text"
                    id="middle-name"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Middle Name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Last Name
                </label>
                <div className="relative">
                  <IconUser
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="text"
                    id="last-name"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="id-number"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Id Number
                </label>
                <div className="relative">
                  <IconId
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="text"
                    id="id-number"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Id Number"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Password
                </label>
                <div className="relative">
                  <IconLock
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="password"
                    id="password"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="uppercase text-xs font-bold tracking-wider block mb-1 text-brand-green-600"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <IconLock
                    className="absolute top-1/2 left-2 -translate-y-1/2 text-brand-green-600"
                    size={20}
                  />
                  <input
                    type="password"
                    id="confirm-password"
                    className="bg-gray-50 w-full border border-gray-300 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-all"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5">
              <button
                type="submit"
                className="btn-primary py-2.5 rounded-lg w-full shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex justify-center items-center gap-2">
                    <IconLoader2 className="animate-spin" size={20} /> Creating
                    Account
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
          <div className="flex flex-col gap-2 items-center mt-2 text-sm text-gray-600">
            <button
              className="text-brand-brown-600 font-semibold hover:underline"
              onClick={openLogin}
            >
              Back to login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModals;
