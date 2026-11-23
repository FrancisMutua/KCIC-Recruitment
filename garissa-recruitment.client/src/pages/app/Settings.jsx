import { useState } from "react";
import { toast } from "react-toastify";
import { IconEye, IconEyeOff, IconLoader2, IconLock, IconMail } from "@tabler/icons-react";
import { apiFetch, readJson } from "../../lib/http";
import { getProfile } from "../../lib/session";
import { Card, Field, PageHeader } from "../../components/ui/kit";

function PasswordInput({ id, name, value, onChange, autoComplete, describedBy }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <input id={id} name={name} type={shown ? "text" : "password"} value={value} onChange={onChange} autoComplete={autoComplete}
        aria-describedby={describedBy} required className="field-input pr-11" />
      <button type="button" onClick={() => setShown((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-brand-green-700"
        aria-label={shown ? "Hide password" : "Show password"}>
        {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
}

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const Settings = () => {
  const [passwords, setPasswords] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const email = getProfile()?.EmailAddress;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const next = {};
    if (!passwords.currentPassword) next.currentPassword = "Enter your current password.";
    if (passwords.newPassword.length < 6) next.newPassword = "Use at least 6 characters.";
    if (passwords.confirmPassword !== passwords.newPassword) next.confirmPassword = "The new passwords don't match.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch("/api/auth/changepassword", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.accessToken}` },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      const result = await readJson(response);
      if (!result.success) throw new Error(result.message);
      toast.success(result.message);
      setPasswords(EMPTY);
    } catch (error) {
      toast.error(error.message || "An error occurred while changing password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Account settings" subtitle="Manage how you sign in to the recruitment portal." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Sign-in email" className="lg:col-span-1">
          <p className="flex items-center gap-2 text-sm text-slate-700"><IconMail size={18} className="shrink-0 text-brand-green" /><span className="break-all">{email || "—"}</span></p>
          <p className="mt-3 text-xs text-slate-500">This is also where we send activation links and notifications. Contact HR to change it.</p>
        </Card>

        <Card title="Change password" className="lg:col-span-2" actions={<IconLock size={18} className="text-slate-400" />}>
          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <Field id="current-password" label="Current password" required error={errors.currentPassword}>
              <PasswordInput id="current-password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} autoComplete="current-password" describedBy={errors.currentPassword ? "current-password-error" : undefined} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="new-password" label="New password" required error={errors.newPassword} hint="At least 6 characters.">
                <PasswordInput id="new-password" name="newPassword" value={passwords.newPassword} onChange={handleChange} autoComplete="new-password" describedBy={errors.newPassword ? "new-password-error" : "new-password-hint"} />
              </Field>
              <Field id="confirm-password" label="Confirm new password" required error={errors.confirmPassword}>
                <PasswordInput id="confirm-password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} autoComplete="new-password" describedBy={errors.confirmPassword ? "confirm-password-error" : undefined} />
              </Field>
            </div>
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading && <IconLoader2 size={18} className="animate-spin" />}
                {loading ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
