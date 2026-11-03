import { useNavigate, useLocation } from "react-router-dom";
import { 
  IconLayoutDashboard, 
  IconBriefcase, 
  IconUser, 
  IconSettings, 
  IconLogout,
  IconX
} from "@tabler/icons-react";
import logo from "../../assets/images/logo.svg";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/app", icon: <IconLayoutDashboard size={20} /> },
    { name: "My Applications", path: "/app/applications", icon: <IconBriefcase size={20} /> },
    { name: "Profile", path: "/app/profile", icon: <IconUser size={20} /> },
    { name: "Settings", path: "/app/settings", icon: <IconSettings size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white z-50 transition-all duration-300
        w-64 lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full bg-gradient-primary">
          {/* Logo Section */}
          <div className="h-20 bg-white text-center px-6 border-b border-brand-green/30 flex justify-between items-center shrink-0">
            <img src={logo} alt="TelPosta Pension Scheme logo" className="h-[68px] w-auto" />
            <button className="lg:hidden text-white/70 hover:text-white" onClick={onClose}>
              <IconX size={24} />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex-1 overflow-y-auto pt-4 space-y-1 relative overflow-x-hidden border-b-0!important">
            {menuItems.map((item) => {
              const isActive = 
                  location.pathname === item.path || 
                  (item.path === '/app/profile' && location.pathname === '/app/profile-update') ||
                  (item.path === '/app/applications' && (location.pathname.startsWith('/app/application-details') || location.pathname.startsWith('/app/job-details')));
              return (
                <div key={item.name} className="relative">
                  {/* The curved active state logic */}
                  {isActive && (
                    <>
                      {/* Top Inverted Curve */}
                      <div className="absolute -top-5 right-0 w-5 h-5 bg-slate-50 lg:block hidden z-10">
                        <div className="w-full h-full bg-gradient-primary rounded-br-2xl"></div>
                      </div>
                      
                      {/* Gap filler to ensure seamless merge with main background */}
                      <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-slate-50 z-20 -mr-[1px] lg:block hidden"></div>

                      {/* Bottom Inverted Curve */}
                      <div className="absolute -bottom-5 right-0 w-5 h-5 bg-slate-50 lg:block hidden z-10">
                        <div className="w-full h-full bg-gradient-primary rounded-tr-2xl"></div>
                      </div>
                    </>
                  )}
                  
                  <div className="pl-3 relative z-30">
                    <button
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3.5 transition-all duration-300 relative
                        ${isActive 
                          ? 'bg-slate-50 text-brand-navy font-bold rounded-l-[1.5rem] -mr-[1px]' 
                          : 'text-white hover:bg-white/10 rounded-xl mr-3'}
                      `}
                    >
                      <span className={`${isActive ? 'text-brand-navy' : 'text-white'}`}>
                        {item.icon}
                      </span>
                      <span className="tracking-wide text-sm">{item.name}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User/Logout Section */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <IconLogout size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
