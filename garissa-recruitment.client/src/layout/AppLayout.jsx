import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { isSignedIn, POST_LOGIN_REDIRECT } from "../lib/session";
import { useModal } from "../context/ModalContext";

function RequireSignIn() {
  const location = useLocation();
  const { openLogin } = useModal();
  useEffect(() => {
    try { sessionStorage.setItem(POST_LOGIN_REDIRECT, location.pathname + location.search); } catch { /* ignore */ }
    openLogin();
  }, [location, openLogin]);
  return <Navigate to="/" replace />;
}

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isSignedIn()) return <RequireSignIn />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      <a href="#app-main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 btn btn-primary">Skip to content</a>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main id="app-main" className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden scroll-smooth">
          <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <div className="mx-auto max-w-6xl space-y-6">
              <Outlet />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
