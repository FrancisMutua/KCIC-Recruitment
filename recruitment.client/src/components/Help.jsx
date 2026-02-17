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
} from "react-icons/fa";
import { changeDocumentTitle } from "../scripts/script";

const Help = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Create an Account",
      desc: "Register on the portal using your valid email address and ID number. You will receive an activation link via email.",
    },
    {
      icon: <FaSearch />,
      title: "Browse Vacancies",
      desc: "Explore the 'Vacancies' page to find positions that match your skills and qualifications.",
    },
    {
      icon: <FaFileAlt />,
      title: "Complete Profile",
      desc: "Fill in your personal details, education history, and upload necessary documents like your CV and Certificates.",
    },
    {
      icon: <FaCheckCircle />,
      title: "Submit Application",
      desc: "Review your details and submit your application. You can track your real-time status in your dashboard.",
    },
  ];

  const faqs = [
    {
      q: "How do I reset my password?",
      a: "Click on the 'Login' page and select 'Forgot Password'. Enter your registered email to receive a secure reset link.",
    },
    {
      q: "Can I apply for multiple positions?",
      a: "Yes, you can apply for multiple vacancies as long as you meet the specific requirements for each role.",
    },
    {
      q: "What documents are required?",
      a: "Commonly required documents include a detailed CV, National ID, and Academic Certificates in PDF format.",
    },
    {
      q: "How long does the shortlisting process take?",
      a: "Processing times vary. You will be notified via email or your dashboard if you are shortlisted for an interview.",
    },
  ];

  useEffect(function () {
    changeDocumentTitle("Help");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-12 lg:px-20 animate-in fade-in duration-700">
      {/* 1. HERO SECTION */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-2xl md:text-3xl font-black text-[#00171f] mb-4 tracking-tight">
          How to <span className="text-red-600">Apply</span>
        </h1>
        <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
          Follow our simple four-step process to kickstart your professional
          career with KUCCPS.
        </p>
      </div>

      {/* 2. STEPS SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-20">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            {/* Step Number Badge */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-lg z-10">
              {index + 1}
            </div>

            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-3xl shadow-sm h-full hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-red-600 text-2xl mb-6 bg-red-50 w-12 h-12 rounded-xl flex items-center justify-center">
                {step.icon}
              </div>
              <h3 className="text-sm md:text-base font-black text-gray-800 mb-2">
                {step.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DOWNLOADS & FAQ GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* FAQ Section */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-lg md:text-xl font-black text-[#00171f] uppercase tracking-tight flex items-center gap-3 mb-6">
            <FaQuestionCircle className="text-red-600" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden cursor-pointer hover:border-red-100 transition-colors"
                onClick={() => toggleFaq(index)}
              >
                <div className="p-4 md:p-5 flex justify-between items-center">
                  <span className="text-sm md:text-base font-bold text-gray-700 ">
                    {faq.q}
                  </span>
                  <FaChevronDown
                    size={12}
                    className={`text-gray-400 transition-transform ${activeFaq === index ? "rotate-180" : ""}`}
                  />
                </div>
                {activeFaq === index && (
                  <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-sm text-gray-500 border-t border-gray-50 pt-4 font-medium leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Resources & Support */}
        <div className="lg:col-span-4 space-y-6">
          {/* Download Guide */}
          <div className="bg-[#00171f] p-6 md:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 -mr-10 -mt-10 rounded-full" />
            <h4 className="text-lg font-black uppercase tracking-tight mb-2">
              User Manual
            </h4>
            <p className="text-gray-400 text-xs md:text-sm font-medium mb-6 leading-relaxed">
              Download the detailed step-by-step PDF guide for portal
              navigation.
            </p>
            <button className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 w-full justify-center py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95">
              <FaDownload size={14} /> Download Guide
            </button>
          </div>

          {/* Contact Support */}
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm">
            <h4 className="text-base font-black text-[#00171f] uppercase tracking-tight mb-6">
              Still need help?
            </h4>
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                  <FaPhoneAlt size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
                    Call Us
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    +254 712 345 678
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                  <FaEnvelope size={14} />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">
                    Email Support
                  </p>
                  <p className="text-sm font-bold text-gray-700">
                    support@kuccps.ac.ke
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
