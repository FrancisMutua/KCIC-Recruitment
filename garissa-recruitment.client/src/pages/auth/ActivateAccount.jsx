import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconCheck, IconX, IconLoader2 } from "@tabler/icons-react";
import { apiFetch, readJson } from "../../lib/http";

const ActivateAccount = () => {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Activating your account...");
  const location = useLocation();
  const navigate = useNavigate();

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
          setTimeout(() => {
            navigate("/");
          }, 3000);
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <IconLoader2 className="animate-spin text-brand-green-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">Activating Account</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="bg-brand-green-50 p-3 rounded-full mb-4">
              <IconCheck className="text-brand-green-600" size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-brand-green-700">Success!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="btn-primary px-6 py-2 rounded hover:opacity-90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <div className="bg-brand-brown-100 p-3 rounded-full mb-4">
              <IconX className="text-brand-brown-600" size={48} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-brand-brown-700">Activation Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Go Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
