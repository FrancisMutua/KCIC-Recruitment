import { Outlet } from "react-router-dom";
import { ModalProvider } from "../context/ModalContext";
import AuthModals from "../components/AuthModals";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GlobalLayout = () => {
  return (
    <ModalProvider>
      <Outlet />
      <AuthModals />
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </ModalProvider>
  );
};

export default GlobalLayout;
