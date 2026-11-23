import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ModalProvider, useModal } from "../context/ModalContext";
import AuthModals from "../components/AuthModals";
import { SESSION_EXPIRED_EVENT } from "../lib/http";
import { POST_LOGIN_REDIRECT, signOut } from "../lib/session";

/** Signs the applicant out and asks them to sign in again when their token expires. */
function SessionWatcher() {
  const { openLogin } = useModal();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onExpired = () => {
      signOut();
      try { sessionStorage.setItem(POST_LOGIN_REDIRECT, location.pathname + location.search); } catch { /* ignore */ }
      toast.info("Your session has expired. Please sign in again to continue where you left off.", { toastId: "session-expired" });
      navigate("/");
      openLogin();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [location, navigate, openLogin]);
  return null;
}

const GlobalLayout = () => (
  <ModalProvider>
    <SessionWatcher />
    <Outlet />
    <AuthModals />
    <ToastContainer position="top-center" autoClose={5000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
  </ModalProvider>
);

export default GlobalLayout;
