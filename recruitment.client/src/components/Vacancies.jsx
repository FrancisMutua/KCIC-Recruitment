import { useNavigate } from "react-router-dom";
import {
  FaBriefcase,
  FaChevronRight,
  FaInbox,
  FaCalendarAlt,
} from "react-icons/fa";
import { useJobs } from "../context/JobContext";
import Spinner from "./Spinner";
import Message from "./Message";
import { useEffect } from "react";
import { changeDocumentTitle } from "../scripts/script";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const Vacancies = () => {
  const navigate = useNavigate();
  const { jobs, isLoading, error } = useJobs();

  useEffect(function () {
    changeDocumentTitle("Vacancies");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaBriefcase className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight">
              Available <span className="text-red-600">Vacancies</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14 max-w-2xl">
            Official KUCCPS Career Portal &bull; Find your next professional
            milestone within the placement service.
          </p>
        </div>

        {/* Total Jobs Stat Card */}
        <div className="bg-white border border-gray-100 p-4 px-6 md:px-8 rounded-2xl md:rounded-3xl shadow-sm flex items-center justify-between lg:justify-start gap-6">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-0.5">
              Active Listings
            </p>
            <p className="text-2xl md:text-3xl font-black text-[#00171f]">
              {jobs.length}
            </p>
          </div>
          <div className="w-[1px] h-10 bg-gray-100" />
          <div className="hidden sm:block">
            <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em] mb-0.5">
              Status
            </p>
            <span className="text-green-600 text-[10px] font-black bg-green-50 px-2 py-1 rounded uppercase border border-green-100">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      {isLoading && <Spinner />}
      {error && <Message message={error} />}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* MOBILE LIST VIEW (Visible on Mobile only) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {jobs.map((job) => (
              <div
                key={job.documentNo}
                onClick={() =>
                  navigate(
                    `/app/job-details?jobId=${job.jobId}&referenceNo=${job.documentNo}`,
                  )
                }
                className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    {job.documentNo}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-[9px] font-black uppercase">
                    {job.vacancy} Positions
                  </div>
                </div>

                <h3 className="text-base font-black text-[#00171f] leading-tight mb-1">
                  {job.jobTitle}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">
                  {job.jobId}
                </p>

                <div className="grid grid-cols-2 gap-2 py-3 border-y border-gray-50 my-4 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-gray-400 font-black uppercase tracking-tighter">
                      Start Date
                    </span>
                    <span className="text-gray-600 font-bold">
                      {formatDate(job.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-red-400 font-black uppercase tracking-tighter">
                      Deadline
                    </span>
                    <span className="text-red-600 font-bold">
                      {formatDate(job.endDate)}
                    </span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 bg-[#00171f] text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
                  View Details
                  <FaChevronRight className="text-[8px]" />
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (Visible MD and up) */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Ref No.
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Job Title & ID
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Openings
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Application Period
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((job) => (
                    <tr
                      key={job.documentNo}
                      className="group hover:bg-gray-50/80 transition-all duration-300 cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-100">
                          {job.documentNo}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-black text-gray-800 group-hover:text-red-600 transition-colors">
                            {job.jobTitle}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {job.jobId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[9px] font-black uppercase border border-gray-100">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          {job.vacancy} Positions
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col text-xs space-y-0.5">
                          <span className="text-gray-400 italic">
                            Start: {formatDate(job.startDate)}
                          </span>
                          <span className="text-red-600 font-black">
                            Ends: {formatDate(job.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/app/job-details?jobId=${job.jobId}&referenceNo=${job.documentNo}`,
                            );
                          }}
                          className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#00171f] px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#00171f] hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          Details
                          <FaChevronRight className="text-[10px]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {jobs.length === 0 && (
            <div className="py-20 md:py-32 flex flex-col items-center justify-center text-center px-6">
              <div className="bg-gray-50 p-6 md:p-8 rounded-full mb-6">
                <FaInbox className="text-4xl md:text-6xl text-gray-200" />
              </div>
              <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">
                No vacancies found
              </h3>
              <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium mt-1">
                Please check back later for new career opportunities at KUCCPS.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Vacancies;
