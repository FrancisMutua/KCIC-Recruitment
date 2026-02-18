import { Outlet } from "react-router-dom";
import { ModalProvider } from "../context/ModalContext";
import AuthModals from "../components/AuthModals";

const GlobalLayout = () => {
  return (
    <ModalProvider>
      <Outlet />
      <AuthModals />
    </ModalProvider>
  );
};

export default GlobalLayout;
