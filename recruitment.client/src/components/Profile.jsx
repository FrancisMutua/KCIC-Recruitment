import { useEffect, useState } from "react";
import { FaUser, FaLock, FaTrashAlt } from "react-icons/fa";
import General from "../profile/General";
import Security from "../profile/Security";
import { useAccount } from "../context/AccountContext";
import { useNavigate } from "react-router-dom";
import { changeDocumentTitle } from "../scripts/script";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const { hasUpdatedProfile } = useAccount();

  const tabs = [
    { id: "general", label: "General Information", icon: <FaUser /> },
    { id: "security", label: "Security Settings", icon: <FaLock /> },
  ];

  useEffect(
    function () {
      if (hasUpdatedProfile === false) navigate("/app/update-profile");
    },
    [hasUpdatedProfile, navigate],
  );

  useEffect(function () {
    changeDocumentTitle("Profile Settings");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-10 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight">
          Account <span className="text-red-600">Settings</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base font-medium mt-1">
          Manage your personal information, contact details, and secure your
          account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. LEFT SIDEBAR: Navigation */}
        <aside className="lg:col-span-3 space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">
            Preferences
          </p>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100"
              }`}
            >
              <span className="text-base opacity-80">{tab.icon}</span>
              {tab.label}
            </button>
          ))}

          {/* DANGER ZONE */}
          <div className="mt-12 p-6 bg-red-50/50 rounded-3xl border border-red-100/50">
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-2">
              Danger Zone
            </h4>
            <p className="text-red-800/60 text-xs leading-relaxed mb-4 font-medium">
              Once you deactivate your account, there is no going back. Please
              be certain.
            </p>
            <button className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-wider hover:text-red-700 transition-colors group">
              <FaTrashAlt className="group-hover:scale-110 transition-transform" />
              Deactivate Account
            </button>
          </div>
        </aside>

        {/* 3. RIGHT CONTENT: Form Area */}
        <main className="lg:col-span-9">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden min-h-[500px]">
            {activeTab === "general" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <General />
              </div>
            )}
            {activeTab === "security" && (
              <div className="animate-in slide-in-from-right-4 duration-500">
                <Security />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
