import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import RootNav from "../pages/RootNav";
import RootFooter from "../pages/RootFooter";
import RootBrand from "../pages/RootBrand";
import RootAdvertisedJobs from "../pages/RootAdvertisedJobs";
import { ToastContainer } from "react-toastify";
import { changeDocumentTitle } from "../scripts/script";


const RootLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Only clear user session if we are actually on the home page, not just passing through or rendering RootLayout
  useEffect(() => {
    if (isHomePage) {
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
    }
  }, [isHomePage]);

  changeDocumentTitle("Home");
  return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <RootNav />
        {isHomePage && (
          <>
            <RootBrand />
            <RootAdvertisedJobs />
          </>
        )}
        <Outlet />
        <RootFooter />
        <ToastContainer
          position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
  );
};

export default RootLayout;
