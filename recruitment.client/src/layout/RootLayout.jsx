import { Outlet } from "react-router-dom";
import RootNav from "../pages/RootNav";
import RootFooter from "../pages/RootFooter";
import RootBrand from "../pages/RootBrand";
import { ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import { useEffect } from "react";
import { changeDocumentTitle } from "../scripts/script";

const RootLayout = () => {
  localStorage.removeItem("accessToken");

  useEffect(function () {
    changeDocumentTitle("Home Page");

    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-red-800/10">
      <RootNav />
      <RootBrand />
      <Outlet />
      <RootFooter />
      <div className="text-base">
        <ToastContainer autoClose={10000} />
      </div>
    </div>
  );
};

export default RootLayout;
