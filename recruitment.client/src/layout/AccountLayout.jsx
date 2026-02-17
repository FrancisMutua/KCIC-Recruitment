import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";

const AccountLayout = () => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-red-700/10">
      <Outlet />
      <div className="text-base">
        <ToastContainer autoClose={10000} />
      </div>
    </div>
  );
};

export default AccountLayout;
