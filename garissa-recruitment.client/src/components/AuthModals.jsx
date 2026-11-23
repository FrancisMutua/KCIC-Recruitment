import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEyeOff, IconId, IconLoader2, IconLock, IconMail, IconUser, IconX } from "@tabler/icons-react";
import logo from "../assets/images/logo.png";
import { useModal } from "../context/ModalContext";
import { apiFetch, readJson } from "../lib/http";
import { POST_LOGIN_REDIRECT } from "../lib/session";

function Dialog({ title, subtitle, onClose, wide = false, children, footer }) {
  const panelRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector("input")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; };
  }, [title]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title"
        className={`relative w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} max-h-[95vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl`}>
        <div className="h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-gold" aria-hidden="true" />
        <button type="button" onClick={onClose} className="btn btn-ghost absolute right-3 top-4 p-2" aria-label="Close"><IconX size={20} /></button>
        <div className="px-6 pb-6 pt-7 sm:px-8">
          <img src={logo} alt="Garissa University" className="h-10 w-auto" />
          <h2 id="auth-dialog-title" className="mt-5 text-2xl font-bold">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-600">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function IconInput({ id, label, icon, type = "text", value, onChange, required = true, autoComplete, hint, reveal }) {
  const Icon = icon;
  const [shown, setShown] = useState(false);
  const actualType = reveal ? (shown ? "text" : "password") : type;
  return (
    <div>
      <label htmlFor={id} className="field-label">{label}{required && <span className="required-mark" aria-hidden="true">*</span>}</label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input id={id} type={actualType} value={value} onChange={(e) => onChange(e.target.value)} required={required} autoComplete={autoComplete}
          aria-describedby={hint ? `${id}-hint` : undefined} className={`field-input pl-10 ${reveal ? "pr-11" : ""}`} />
        {reveal && (
          <button type="button" onClick={() => setShown((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-brand-green-700" aria-label={shown ? "Hide password" : "Show password"}>
            {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        )}
      </div>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}

function SubmitButton({ loading, label, busyLabel }) {
  return (
    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
      {loading && <IconLoader2 className="animate-spin" size={18} />}
      {loading ? busyLabel : label}
    </button>
  );
}

const LinkButton = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="font-semibold text-brand-green-700 hover:underline">{children}</button>
);

const AuthModals = () => {
  const { showLoginModal, showForgotPasswordModal, showCreateAccountModal, openLogin, openSignUp, openForgotPassword, closeModals } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetSecrets = () => { setPassword(""); setConfirmPassword(""); };

  const handleSubmitCreateAccount = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("The two passwords do not match."); return; }
    try {
      setLoading(true);
      const response = await apiFetch("/api/auth/createaccount", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailAddress, firstName, middleName, lastName, idNumber, password }),
      });
      const result = await readJson(response);
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      setFirstName(""); setMiddleName(""); setLastName(""); setIdNumber(""); resetSecrets();
      openLogin();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await apiFetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: emailAddress, password }),
      });
      const result = await readJson(response);
      if (result.success === false) throw new Error(result.message);
      const token = result.data;

      const profileResponse = await apiFetch("/api/auth/profile", { headers: { Authorization: `Bearer ${token.accessToken}` } });
      const profileResult = await readJson(profileResponse);
      localStorage.setItem("user", JSON.stringify(token));
      if (profileResult.success) localStorage.setItem("userProfile", JSON.stringify(profileResult.data));

      setEmailAddress(""); resetSecrets();
      closeModals();

      let redirect = null;
      try { redirect = sessionStorage.getItem(POST_LOGIN_REDIRECT); sessionStorage.removeItem(POST_LOGIN_REDIRECT); } catch { /* ignore */ }
      if (!token.isProfileUpdated) navigate("/app/profile-update", { state: { next: redirect } });
      else navigate(redirect || "/app");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForgotPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("The two passwords do not match."); return; }
    try {
      setLoading(true);
      const response = await apiFetch("/api/auth/resetpassword", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: emailAddress, password }),
      });
      const result = await readJson(response);
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      resetSecrets();
      openLogin();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showLoginModal) {
    return (
      <Dialog title="Welcome back" subtitle="Sign in to continue your applications." onClose={closeModals}
        footer={<>New to Garissa University careers? <LinkButton onClick={openSignUp}>Create an account</LinkButton></>}>
        <form className="space-y-4" onSubmit={handleLogin}>
          <IconInput id="login-email" label="Email address" icon={IconMail} type="email" value={emailAddress} onChange={setEmailAddress} autoComplete="email" />
          <div>
            <IconInput id="login-password" label="Password" icon={IconLock} reveal value={password} onChange={setPassword} autoComplete="current-password" />
            <div className="mt-2 text-right text-sm"><LinkButton onClick={openForgotPassword}>Forgot password?</LinkButton></div>
          </div>
          <SubmitButton loading={loading} label="Sign in" busyLabel="Signing in…" />
        </form>
      </Dialog>
    );
  }

  if (showForgotPasswordModal) {
    return (
      <Dialog title="Reset your password" subtitle="Enter the email you registered with and choose a new password." onClose={closeModals}
        footer={<LinkButton onClick={openLogin}>Back to sign in</LinkButton>}>
        <form className="space-y-4" onSubmit={handleSubmitForgotPassword}>
          <IconInput id="reset-email" label="Email address" icon={IconMail} type="email" value={emailAddress} onChange={setEmailAddress} autoComplete="email" />
          <IconInput id="reset-password" label="New password" icon={IconLock} reveal value={password} onChange={setPassword} autoComplete="new-password" />
          <IconInput id="reset-confirm" label="Confirm new password" icon={IconLock} reveal value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          <SubmitButton loading={loading} label="Reset password" busyLabel="Resetting password…" />
        </form>
      </Dialog>
    );
  }

  if (showCreateAccountModal) {
    return (
      <Dialog wide title="Create your account" subtitle="Use your legal names exactly as on your ID — they are copied onto every application." onClose={closeModals}
        footer={<>Already registered? <LinkButton onClick={openLogin}>Sign in</LinkButton></>}>
        <form onSubmit={handleSubmitCreateAccount} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <IconInput id="signup-first" label="First name" icon={IconUser} value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <IconInput id="signup-middle" label="Middle name" icon={IconUser} value={middleName} onChange={setMiddleName} required={false} autoComplete="additional-name" />
            <IconInput id="signup-last" label="Last name" icon={IconUser} value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <IconInput id="signup-email" label="Email address" icon={IconMail} type="email" value={emailAddress} onChange={setEmailAddress} autoComplete="email" hint="We'll send an activation link here." />
            <IconInput id="signup-id" label="ID / passport number" icon={IconId} value={idNumber} onChange={setIdNumber} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <IconInput id="signup-password" label="Password" icon={IconLock} reveal value={password} onChange={setPassword} autoComplete="new-password" />
            <IconInput id="signup-confirm" label="Confirm password" icon={IconLock} reveal value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          </div>
          <SubmitButton loading={loading} label="Create account" busyLabel="Creating your account…" />
        </form>
      </Dialog>
    );
  }

  return null;
};

export default AuthModals;
