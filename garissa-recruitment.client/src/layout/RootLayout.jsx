import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import RootNav from "../pages/RootNav";
import RootFooter from "../pages/RootFooter";
import RootBrand from "../pages/RootBrand";
import RootAdvertisedJobs from "../pages/RootAdvertisedJobs";
import { changeDocumentTitle } from "../scripts/script";

const RootLayout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    if (isHomePage) changeDocumentTitle("Careers");
  }, [isHomePage]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn btn-primary">Skip to content</a>
      <RootNav />
      <main id="main" className="flex-1">
        {isHomePage && (
          <>
            <RootBrand />
            <RootAdvertisedJobs />
          </>
        )}
        <Outlet />
      </main>
      <RootFooter />
    </div>
  );
};

export default RootLayout;
