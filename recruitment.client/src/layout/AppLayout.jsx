import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "../components/SideNav";
import MainNav from "../components/MainNav";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AppLayout = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const toggleSideNav = () => setIsSideNavOpen(!isSideNavOpen);

  return (
    <div className="min-h-screen bg-gray-50/50 flex transition-colors duration-300">
      {/* 1. Sidebar - Fixed width w-72 (18rem) */}
      <SideNav isOpen={isSideNavOpen} toggleSideNav={toggleSideNav} />

      {/* 2. Content Area - Margin matches Sidebar width (72) */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        {/* Top Navigation */}
        <MainNav toggleSideNav={toggleSideNav} />

        {/* 3. Scrollable Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1">
            {/* Standardized Padding for all internal pages */}
            <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
              <Outlet />
            </div>
          </div>

          {/* 4. Footer (Non-sticky, scrolls with content) */}
          <Footer />
        </main>
      </div>

      {/* Global Toast Container */}
      <div className="text-base">
        <ToastContainer autoClose={10000} />
      </div>
    </div>
  );
};

export default AppLayout;
