import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaExclamationTriangle } from "react-icons/fa";
import { useEffect } from "react";
import { changeDocumentTitle } from "../scripts/script";

const PageNotFound = () => {
  const navigate = useNavigate();

  useEffect(function () {
    changeDocumentTitle("Page Not Found");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-[#00171f] px-6 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main 404 Card */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl max-w-[500px] w-full text-center animate-in fade-in zoom-in duration-500">
        {/* Icon & Error Code */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-600/20 p-5 rounded-2xl mb-4">
            <FaExclamationTriangle className="text-red-600 text-4xl" />
          </div>
          <h1 className="text-7xl md:text-8xl font-black leading-none tracking-tighter text-white/10 select-none">
            404
          </h1>
        </div>

        {/* Messaging */}
        <div className="space-y-2 mb-10">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
            Lost in <span className="text-red-600">Transit?</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium leading-relaxed max-w-[320px] mx-auto">
            The page you are looking for doesn't exist or has been relocated
            within the portal.
          </p>
        </div>

        {/* Professional Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-white/10"
          >
            <FaArrowLeft className="text-[10px]" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/app/dashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-red-900/40 transition-all active:scale-95"
          >
            <FaHome size={14} />
            Dashboard
          </button>
        </div>
      </div>

      {/* Footer Branding - Industry Standard Micro-Typography */}
      <div className="absolute bottom-8 text-center">
        <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px]">
          KUCCPS Recruitment Portal &bull; System Error
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;
