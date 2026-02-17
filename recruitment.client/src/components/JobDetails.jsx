import { useNavigate, useSearchParams } from "react-router-dom";
import { useJobs } from "../context/JobContext";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import Message from "../components/Message";
import {
  FaChevronRight,
  FaArrowLeft,
  FaListCheck,
  FaBriefcase,
  FaUserGraduate,
  FaCircle,
  FaPaperPlane,
} from "react-icons/fa6";
import { toast } from "react-toastify";
import { useProfileUpdate } from "../hooks/useProfileUpdate";
import { changeDocumentTitle } from "../scripts/script";

const JobDetails = () => {
  const navigate = useNavigate();
  const { jobDetails, getJobDetails, isLoading, error } = useJobs();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const referenceNo = searchParams.get("referenceNo");
  const token = localStorage.getItem("accessToken");

  const { hasUpdatedProfile, isLoading: isProfileUpdateLoading } =
    useProfileUpdate();

  useEffect(() => {
    if (jobId) getJobDetails(jobId);
  }, [jobId]);

  const handleApply = async () => {
    if (isProfileUpdateLoading === false && hasUpdatedProfile === false) {
      navigate("/app/update-profile");
      return;
    }

    if (!token) {
      navigate("/account/login");
      return;
    }

    try {
      setLoading(true);
      const newObj = { jobId, referenceNo, token };

      const response = await fetch(`/api/job/submitjobapplication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newObj),
      });
      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
      const documentNo = result.documentNo;
      toast.success(
        `Job application reference number ${documentNo} created successfully!`,
      );
      navigate(`/app/minimum-requirements?documentNo=${documentNo}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(function () {
    changeDocumentTitle("Job Details");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  if (isLoading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner />
        <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">
          Fetching Job Details...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <Message message={error} />
      </div>
    );
  if (!jobDetails) return null;

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-500 bg-gray-50/30 min-h-screen">
      {/* 1. HEADER / ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 hover:shadow-sm transition-all group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-black text-[#00171f] tracking-tight">
              Position <span className="text-red-600">Details</span>
            </h1>
            <p className="text-gray-500 text-xs md:text-sm font-medium">
              Review requirements carefully before submission.
            </p>
          </div>
        </div>

        <button
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-100 transition-all active:scale-95 disabled:bg-gray-400"
          disabled={loading}
          onClick={handleApply}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <FaPaperPlane /> Apply Now
            </>
          )}
        </button>
      </div>

      {/* 2. MAIN CONTENT CARD */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Job Title Card */}
        <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
            <FaBriefcase size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">
              Job Reference: {jobId}
            </p>
            <h2 className="text-xl md:text-2xl font-black text-[#00171f] leading-tight">
              {jobDetails.jobTitle || "Not Specified"}
            </h2>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Job Purpose */}
          <section className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
              <FaCircle className="text-red-600 text-[10px]" />
              <h3 className="text-[10px] md:text-xs font-black text-[#00171f] uppercase tracking-[0.2em]">
                Job Purpose
              </h3>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-gray-600 font-medium">
              {jobDetails.purpose}
            </p>
          </section>

          {/* Requirements */}
          <section className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
              <FaUserGraduate className="text-red-600 text-base" />
              <h3 className="text-[10px] md:text-xs font-black text-[#00171f] uppercase tracking-[0.2em]">
                Requirements
              </h3>
            </div>
            <ul className="space-y-3">
              {jobDetails.requirements?.map((requirement, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3.5 bg-gray-50/50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                >
                  <div className="mt-1 bg-red-100 rounded-full p-1 shrink-0">
                    <FaChevronRight className="text-red-600 text-[8px]" />
                  </div>
                  <span className="text-sm md:text-base text-gray-600 font-semibold leading-snug">
                    {requirement.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Responsibilities */}
          <section className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
              <FaListCheck className="text-red-600 text-base" />
              <h3 className="text-[10px] md:text-xs font-black text-[#00171f] uppercase tracking-[0.2em]">
                Responsibilities
              </h3>
            </div>
            <ul className="space-y-3">
              {jobDetails.responsibilities?.map((res, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 p-3.5 bg-gray-50/50 rounded-xl border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="mt-1 bg-slate-900 rounded-full p-1 shrink-0">
                    <FaChevronRight className="text-white text-[8px]" />
                  </div>
                  <span className="text-sm md:text-base text-gray-600 font-semibold leading-snug">
                    {res.description}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* 3. FINAL CTA */}
      <div className="bg-[#00171f] rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute top-0 right-0 w-32 h-full bg-red-600/10 -skew-x-12 translate-x-10" />
        <p className="text-gray-300 text-sm md:text-lg font-bold mb-6 relative z-10">
          Interested in this position? Begin your journey today.
        </p>
        <button
          className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-900/40 transition-all active:scale-95 relative z-10 flex items-center justify-center gap-3"
          disabled={loading}
          onClick={handleApply}
        >
          {loading ? "Processing..." : "Submit Your Application"}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
