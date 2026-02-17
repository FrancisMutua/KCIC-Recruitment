import { useEffect, useState } from "react";
import {
  FaUserPlus,
  FaFileAlt,
  FaSearch,
  FaCheckCircle,
  FaQuestionCircle,
  FaChevronDown,
  FaPhoneAlt,
  FaEnvelope,
  FaDownload,
  FaLifeRing,
} from "react-icons/fa";
import { changeDocumentTitle } from "../scripts/script";

const AppHelp = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const steps = [
    {
      icon: <FaUserPlus size={20} />,
      title: "Update Profile",
      desc: "Ensure your personal details, education, and contact info are 100% complete before applying.",
    },
    {
      icon: <FaSearch size={20} />,
      title: "Find Vacancies",
      desc: "Navigate to the Vacancies tab to browse and filter open positions that match your skills.",
    },
    {
      icon: <FaFileAlt size={20} />,
      title: "Upload Documents",
      desc: "Prepare your CV and certificates in PDF format. Attach them to your specific job application.",
    },
    {
      icon: <FaCheckCircle size={20} />,
      title: "Track Status",
      desc: "Use your dashboard to monitor the progress of your applications and view interview invites.",
    },
  ];

  const faqs = [
    {
      q: "How do I update my registered email?",
      a: "For security reasons, email updates must be requested through the ICT support desk with a copy of your National ID attached.",
    },
    {
      q: "Can I withdraw a submitted application?",
      a: "Yes, you can withdraw an application from your 'Track Applications' page as long as the vacancy is still open.",
    },
    {
      q: "Which file formats are allowed for uploads?",
      a: "The system only accepts PDF files. Each document must not exceed 2MB in size.",
    },
    {
      q: "I forgot my password, how do I recover it?",
      a: "Use the 'Forgot Password' link on the login page. A secure reset link will be sent to your registered email address.",
    },
  ];

  useEffect(function () {
    changeDocumentTitle("Help Center");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaLifeRing className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight">
              Help <span className="text-red-600">& Resources</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Everything you need to know about using the KUCCPS Recruitment
            Portal.
          </p>
        </div>
      </div>

      {/* 2. INSTRUCTIONAL STEPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#00171f] text-white rounded-md flex items-center justify-center font-black text-[10px] shadow-md z-10 uppercase">
              0{index + 1}
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-[1.5rem] shadow-sm h-full hover:shadow-md transition-all">
              <div className="text-red-600 mb-4 bg-red-50 w-10 h-10 rounded-xl flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-sm font-black text-[#00171f] mb-1.5 uppercase tracking-tight">
                {step.title}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CONTENT GRID: FAQ & SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FAQ Section */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-2 px-2">
            <FaQuestionCircle className="text-red-600 text-base" />
            <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight">
              Common Questions
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  className="w-full p-4 flex justify-between items-center text-left group"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-red-600 transition-colors">
                    {faq.q}
                  </span>
                  <div
                    className={`p-1.5 rounded-md transition-all ${activeFaq === index ? "bg-red-600 text-white" : "bg-gray-50 text-gray-400"}`}
                  >
                    <FaChevronDown
                      className={`text-[10px] transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {activeFaq === index && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-200">
                    <div className="pt-3 border-t border-gray-50">
                      <p className="text-[11px] md:text-xs text-gray-500 font-medium leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Downloads & Contact */}
        <div className="lg:col-span-4 space-y-6">
          {/* User Manual Card */}
          <div className="bg-[#00171f] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 -mr-8 -mt-8 rounded-full" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500 mb-1">
              Resources
            </p>
            <h4 className="text-base font-black mb-1.5 uppercase tracking-tight">
              Portal Manual
            </h4>
            <p className="text-gray-400 text-[11px] mb-6 font-medium leading-relaxed">
              Step-by-step PDF guide covering all recruitment portal features.
            </p>
            <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 w-full justify-center py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20">
              <FaDownload size={12} /> Download PDF
            </button>
          </div>

          {/* Contact Support Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm">
            <h4 className="text-xs md:text-sm font-black text-[#00171f] mb-6 uppercase tracking-widest">
              Support Desk
            </h4>
            <div className="space-y-5">
              <ContactItem
                icon={<FaPhoneAlt size={12} />}
                label="Call Center"
                value="+254 712 345 678"
              />
              <ContactItem
                icon={<FaEnvelope size={12} />}
                label="Email Support"
                value="support@kuccps.ac.ke"
              />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50 text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">
                Mon - Fri &bull; 8AM - 5PM EAT
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Helper Sub-component */
const ContactItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 group">
    <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 rounded-xl transition-all">
      {icon}
    </div>
    <div>
      <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-xs font-bold text-gray-700 tracking-tight">{value}</p>
    </div>
  </div>
);

export default AppHelp;
