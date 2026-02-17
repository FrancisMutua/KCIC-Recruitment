import { useNavigate, useSearchParams } from "react-router-dom";
import { useJobs } from "../context/JobContext";
import { useEffect } from "react";
import Spinner from "../components/Spinner";
import Message from "../components/Message";
import {
  FaChevronRight,
  FaArrowLeft,
  FaListCheck,
  FaBriefcase,
  FaUserGraduate,
  FaCircle,
} from "react-icons/fa6";
import { changeDocumentTitle } from "../scripts/script";

const RootJobDetails = () => {
  const navigate = useNavigate();
  const { jobDetails, getJobDetails, isLoading, error } = useJobs();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");

  useEffect(() => {
    if (jobId) getJobDetails(jobId);
  }, [jobId]);

  useEffect(function () {
    changeDocumentTitle("Job Details");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <Message message={error} />
      </div>
    );
  if (!jobDetails) return null;

  return (
    <div className="max-w-[1000px] mx-auto py-6 md:py-10 px-4 md:px-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. TOP NAVIGATION */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Vacancies
        </button>

        <button
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-red-900/10 transition-all active:scale-95"
          onClick={() => navigate("/account")}
        >
          Apply for this Position
        </button>
      </div>

      {/* 2. JOB HEADER CARD */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="p-4 bg-red-50 rounded-2xl text-red-600 shrink-0">
            <FaBriefcase size={32} />
          </div>
          <div>
            <span className="text-red-600 font-black uppercase tracking-[0.15em] text-[10px] md:text-xs">
              Reference: {jobId}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 mt-1 leading-tight">
              {jobDetails.jobTitle || "Position Overview"}
            </h1>
          </div>
        </div>
      </div>

      {/* 3. CONTENT GRID */}
      <div className="space-y-6">
        {/* SECTION: JOB PURPOSE */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
            <FaCircle className="text-red-600 text-sm" />
            <h2 className="text-base md:text-lg font-black text-gray-800 uppercase tracking-wider">
              Job Purpose
            </h2>
          </div>
          <p className="text-sm md:text-base leading-relaxed text-gray-600 font-medium">
            {jobDetails.purpose}
          </p>
        </section>

        {/* SECTION: REQUIREMENTS */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
            <FaUserGraduate className="text-red-600 text-lg" />
            <h2 className="text-base md:text-lg font-black text-gray-800 uppercase tracking-wider">
              Job Requirements
            </h2>
          </div>
          <ul className="space-y-3">
            {jobDetails.requirements.map((requirement, index) => (
              <li
                key={requirement.code || index}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="mt-1 shrink-0 bg-red-100 rounded-full p-1">
                  <FaChevronRight className="text-red-600 text-[10px]" />
                </div>
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  {requirement.description}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION: RESPONSIBILITIES */}
        <section className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-50 pb-4">
            <FaListCheck className="text-red-600 text-lg" />
            <h2 className="text-base md:text-lg font-black text-gray-800 uppercase tracking-wider">
              Key Responsibilities
            </h2>
          </div>
          <ul className="space-y-3">
            {jobDetails.responsibilities.map((responsibility, index) => (
              <li
                key={responsibility.code || index}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
              >
                <div className="mt-1 shrink-0 bg-slate-100 rounded-full p-1">
                  <FaChevronRight className="text-slate-600 text-[10px]" />
                </div>
                <span className="text-sm md:text-base text-gray-700 font-medium">
                  {responsibility.description}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 4. FOOTER ACTION */}
      <div className="mt-10 py-10 border-t border-gray-100 flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">
            Ready to apply?
          </p>
          <p className="text-gray-500 text-sm md:text-base">
            Ensure your profile is complete before submitting your application.
          </p>
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-red-900/20 transition-all active:scale-95 flex items-center gap-3"
          onClick={() => navigate("/account")}
        >
          Start Application <FaChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default RootJobDetails;
