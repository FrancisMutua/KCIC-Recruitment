import { Link } from "react-router-dom";
import { useJobs } from "../context/JobContext";
import Spinner from "../components/Spinner";
import Message from "../components/Message";
import {
  FaBriefcase,
  FaCalendarAlt,
  FaChevronRight,
  FaInbox,
} from "react-icons/fa";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const RootJobs = () => {
  const { isLoading, error, jobs } = useJobs();

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-10 px-4 md:px-12 lg:px-20 animate-in fade-in duration-500">
      {/* 1. SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <h2 className="flex items-center gap-3 text-base md:text-2xl font-black text-gray-900 uppercase tracking-tight">
            <FaBriefcase className="text-red-600 text-xl md:text-3xl" />
            Advertised <span className="text-red-600">Jobs</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium">
            Explore current career opportunities and join our professional team.
          </p>
        </div>

        {!isLoading && !error && jobs.length > 0 && (
          <div className="bg-white dark:bg-primary border border-gray-100 p-4 md:px-6 md:py-2 rounded-2xl shadow-sm flex md:flex-col items-center md:items-start justify-between">
            <p className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-widest">
              Available
            </p>
            <p className="text-sm md:text-base font-black text-gray-800 leading-none">
              {jobs.length} Vacancies
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="max-w-2xl mx-auto">
          <Message message={error} />
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* 2. MOBILE CARD LIST (Hidden on Tablet/Desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div
                  key={job.documentNo}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                      {job.documentNo}
                    </span>
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border border-blue-100">
                      {job.vacancy} Positions
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-gray-800 mb-1 leading-tight">
                    {job.jobTitle}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">
                    ID: {job.jobId}
                  </p>

                  <div className="bg-gray-50 rounded-xl p-3 mb-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <FaCalendarAlt className="opacity-50" />
                      <span>Posted: {formatDate(job.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-red-600 font-bold">
                      <FaCalendarAlt />
                      <span>Deadline: {formatDate(job.endDate)}</span>
                    </div>
                  </div>

                  <Link
                    to={`/details?jobId=${job.jobId}`}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md"
                  >
                    View Details
                    <FaChevronRight size={10} />
                  </Link>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>

          {/* 3. DESKTOP TABLE VIEW (Hidden on Mobile) */}
          <div className="hidden md:block bg-white/90 dark:bg-primary rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Reference
                    </th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Job Title & ID
                    </th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Positions
                    </th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Application Period
                    </th>
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.length > 0 ? (
                    jobs.map((job) => (
                      <tr
                        key={job.documentNo}
                        className="group hover:bg-red-50/50 transition-all duration-200"
                      >
                        <td className="p-6">
                          <span className="font-mono text-xs font-bold text-primary dark:text-red-500 bg-gray-100 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-gray-200/50">
                            {job.documentNo}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-black text-gray-700 group-hover:text-red-600 transition-colors">
                              {job.jobTitle}
                            </span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-0.5">
                              ID: {job.jobId}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <span className="inline-flex items-center justify-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black border border-blue-100">
                            {job.vacancy}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-0.5 text-xs">
                            <div className="flex items-center gap-2 text-gray-500 font-medium italic">
                              <span>Start: {formatDate(job.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-red-600 font-black">
                              <span>Ends: {formatDate(job.endDate)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <Link
                            to={`/details?jobId=${job.jobId}`}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95"
                          >
                            Details
                            <FaChevronRight className="text-[10px]" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-4 border-t border-gray-100 px-8">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tight italic">
                * Please ensure you read the job requirements carefully before
                submitting your application.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-300">
    <div className="bg-gray-50 p-6 rounded-full mb-4">
      <FaInbox size={40} className="text-gray-200" />
    </div>
    <p className="text-gray-500 text-sm font-black uppercase tracking-widest">
      No advertised jobs found
    </p>
  </div>
);

export default RootJobs;
