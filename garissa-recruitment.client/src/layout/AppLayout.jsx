import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Fixed/Collapsible */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col pt-6 lg:pt-10">
          <div className="flex-1 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto space-y-8">
              <Outlet />
            </div>
          </div>
          
          {/* Internal Footer (pushed to bottom) */}
          <div className="w-full mt-12">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
