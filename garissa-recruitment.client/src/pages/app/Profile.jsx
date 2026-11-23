import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconPencil, IconMail, IconId } from "@tabler/icons-react";
import { apiFetch, readJson } from "../../lib/http";
import { getUser, initials } from "../../lib/session";
import { formatDate } from "../../lib/bcDate";
import { Alert, Card, Detail, PageHeader, Spinner } from "../../components/ui/kit";

const titleCase = (value) => String(value || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await apiFetch("/api/auth/profile", { headers: { Authorization: `Bearer ${getUser()?.accessToken}` } });
        const result = await readJson(response);
        if (!result.success) throw new Error(result.message);
        if (!active) return;
        setProfile(result.data);
        localStorage.setItem("userProfile", JSON.stringify(result.data));
      } catch (err) {
        if (active) setError(err.message);
      }
    })();
    return () => { active = false; };
  }, []);

  if (error) return <Alert tone="error" title="Your profile couldn't be loaded">{error}</Alert>;
  if (!profile) return <Spinner label="Loading your profile…" />;

  const name = titleCase([profile.FirstName, profile.MiddleName, profile.LastName].filter(Boolean).join(" "));

  return (
    <div className="space-y-6">
      <PageHeader title="My profile" subtitle="These details are copied onto each new application you start."
        actions={<Link to="/app/profile-update" className="btn btn-primary"><IconPencil size={16} /> Update profile</Link>} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-primary text-3xl font-bold text-white ring-4 ring-brand-lime/40">
              {initials(profile)}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{name || "Applicant"}</h2>
            <p className="text-sm text-slate-500">Applicant</p>
            <div className="mt-5 w-full space-y-2 border-t border-slate-100 pt-5 text-left text-sm">
              <p className="flex items-center gap-2 text-slate-600"><IconMail size={16} className="shrink-0 text-slate-400" /><span className="truncate">{profile.EmailAddress}</span></p>
              <p className="flex items-center gap-2 text-slate-600"><IconId size={16} className="shrink-0 text-slate-400" />ID {profile.IdNumber || "—"}</p>
            </div>
          </div>
        </Card>

        <Card title="Personal information" className="lg:col-span-2">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="First name" value={titleCase(profile.FirstName)} />
            <Detail label="Middle name" value={titleCase(profile.MiddleName)} />
            <Detail label="Last name" value={titleCase(profile.LastName)} />
            <Detail label="ID / passport number" value={profile.IdNumber} />
            <Detail label="Phone number" value={profile.TelephoneNo} />
            <Detail label="Date of birth" value={profile.DateOfBirth ? formatDate(profile.DateOfBirth) : ""} />
            <Detail label="Gender" value={profile.Gender} />
            <Detail label="Marital status" value={profile.MaritalStatus} />
            <Detail label="Postal address" value={profile.PostalAddress} />
            <Detail label="Country" value={profile.Country} />
          </dl>
          <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
            Names, email and ID number come from your registration and can't be changed here. Contact HR if they are wrong.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
