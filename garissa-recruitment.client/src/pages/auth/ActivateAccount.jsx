import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import { apiFetch, readJson } from "../../lib/http";
import { useModal } from "../../context/ModalContext";

const ActivateAccount = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Activating your account...");
  const location = useLocation();
  const navigate = useNavigate();
  const { openLogin } = useModal();

  useEffect(() => {
    const activate = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      const email = params.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid activation link.");
        return;
      }

      try {
        const response = await apiFetch("/api/auth/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, email }),
        });

        const data = await readJson(response);

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Activation failed.");
        }
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "An error occurred during activation. Please try again later.");
      }
    };

    activate();
  }, [location, navigate]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12">
      <div className="card card-body w-full text-center" role="status" aria-live="polite">
        {status === "loading" && (
          <>
            <IconLoader2 className="mx-auto animate-spin text-brand-green" size={44} />
            <h1 className="mt-4 text-xl font-bold">Activating your account</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-50 text-brand-green-600"><IconCheck size={30} /></div>
            <h1 className="mt-4 text-xl font-bold">Your account is active</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <button type="button" onClick={() => { navigate("/"); openLogin(); }} className="btn btn-primary mt-6 w-full">Sign in now</button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-brown-50 text-brand-brown-600"><IconX size={30} /></div>
            <h1 className="mt-4 text-xl font-bold">We couldn't activate your account</h1>
            <p className="mt-2 break-words text-sm text-slate-600">{message}</p>
            <p className="mt-3 text-xs text-slate-500">Activation links expire after 24 hours. Signing in with your password sends you a fresh link.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { navigate("/"); openLogin(); }} className="btn btn-primary">Sign in</button>
              <button type="button" onClick={() => navigate("/")} className="btn btn-outline">Go to home page</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
