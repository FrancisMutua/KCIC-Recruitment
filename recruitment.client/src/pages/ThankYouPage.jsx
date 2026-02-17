import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaHome,
  FaSearch,
  FaEnvelopeOpenText,
  FaUserShield,
  FaClock,
  FaClipboardCheck,
} from "react-icons/fa";
import { useEffect } from "react";
import { changeDocumentTitle } from "../scripts/script";

const ThankYouPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo") || "APP-XXXXXX";

  useEffect(function () {
    changeDocumentTitle("Thank you");

    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 md:p-10">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in zoom-in duration-1000">
        {/* 1. SUCCESS CARD */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden text-center p-8 md:p-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
            <FaCheckCircle className="text-green-500 text-7xl md:text-8xl relative z-10" />
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-[#00171f] tracking-tight mb-4">
            Application <span className="text-red-600">Submitted!</span>
          </h1>

          <p className="text-gray-500 text-base md:text-xl font-medium max-w-md mx-auto mb-8">
            Thank you for your interest. Your application has been successfully
            queued for review by our recruitment team.
          </p>

          <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Reference Number
            </span>
            <span className="text-lg font-mono font-bold text-red-600">
              {documentNo}
            </span>
          </div>
        </div>

        {/* 2. "WHAT HAPPENS NEXT" MOBILE-FRIENDLY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NextStepCard
            icon={<FaClock className="text-blue-500" />}
            title="Review Process"
            desc="Our team will evaluate your profile against the job requirements."
          />
          <NextStepCard
            icon={<FaEnvelopeOpenText className="text-purple-500" />}
            title="Notification"
            desc="You will receive an email if you are shortlisted for the next stage."
          />
          <NextStepCard
            icon={<FaUserShield className="text-cyan-500" />}
            title="Portal Update"
            desc="Check your dashboard anytime to track live application status."
          />
        </div>

        {/* 3. ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate("/app/dashboard")}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#00171f] hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-200"
          >
            <FaHome /> Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/app/vacancies")}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-600 hover:text-red-600 px-10 py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all active:scale-95 shadow-sm"
          >
            <FaSearch /> Browse More Jobs
          </button>
        </div>

        {/* FOOTER INFO */}
        <p className="text-center text-gray-400 text-base font-medium">
          A confirmation email has been sent to your registered address. <br />
          Please check your spam folder if you do not see it in your inbox.
        </p>
      </div>
    </div>
  );
};

/* --- Helper Component for "Next Steps" --- */
const NextStepCard = ({ icon, title, desc }) => (
  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-3">
    <div className="text-xl p-3 bg-white rounded-xl shadow-sm">{icon}</div>
    <h3 className="text-base font-black text-[#00171f] uppercase tracking-wider">
      {title}
    </h3>
    <p className="text-[1.2rem] text-gray-500 font-medium leading-relaxed">
      {desc}
    </p>
  </div>
);

export default ThankYouPage;
