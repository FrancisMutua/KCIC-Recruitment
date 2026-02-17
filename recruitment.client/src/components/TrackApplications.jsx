import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaClipboardCheck,
  FaCalendarCheck,
  FaSearch,
  FaInbox,
  FaEye,
  FaInfoCircle,
  FaTasks,
} from "react-icons/fa";
import { useApplications } from "../hooks/useApplications";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const TrackApplications = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { applications, isLoading } = useApplications();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "shortlisted":
        return "bg-green-50 text-green-700 border-green-100";
      case "regret":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getEvalStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "not started":
        return "text-gray-400";
      case "in progress":
        return "text-amber-600";
      case "qualified":
        return "text-green-600";
      case "disqualified":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  const submittedApplications = applications
    .filter(
      (app) =>
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((app) => app.status !== "Open");

  useEffect(function () {
    changeDocumentTitle("Submitted Applications");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-[#00171f] p-2 md:p-2.5 rounded-xl shadow-lg">
              <FaClipboardCheck className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight">
              Application <span className="text-red-600">Tracking</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Monitor submission progress and recruitment evaluations.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search tracking ID or Job..."
            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#00171f] outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
            Syncing Statuses...
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE LIST VIEW */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {submittedApplications.length > 0 ? (
              submittedApplications.map((app) => (
                <div
                  key={app.documentNo}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded border uppercase">
                      {app.documentNo}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusStyle(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#00171f] leading-tight">
                      {app.jobTitle}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Ref: {app.referenceNo}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-2xl">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        Submitted
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-bold">
                        <FaCalendarCheck className="text-green-600 opacity-70" />{" "}
                        {formatDate(app.documentDate)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 border-l border-gray-200 pl-3">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                        Evaluation
                      </span>
                      <div
                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${getEvalStyle(app.evaluationStatus)}`}
                      >
                        <FaTasks className="opacity-70" />{" "}
                        {app.evaluationStatus || "N/A"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/app/preview-application?documentNo=${app.documentNo}&status=${app.status}`,
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 bg-[#00171f] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95"
                  >
                    <FaEye size={10} /> View Application
                  </button>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Tracking No
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Position Details
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      App Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Evaluation
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {submittedApplications.length > 0 ? (
                    submittedApplications.map((app) => (
                      <tr
                        key={app.documentNo}
                        className="hover:bg-gray-50/50 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-mono font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded border border-gray-200 uppercase">
                            {app.documentNo}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-black text-[#00171f] group-hover:text-red-600 transition-colors">
                              {app.jobTitle}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                              ID: {app.referenceNo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border shadow-sm ${getStatusStyle(app.status)}`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-0.5">
                            <span
                              className={`text-[10px] font-black uppercase flex items-center gap-2 ${getEvalStyle(app.evaluationStatus)}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full bg-current ${app.evaluationStatus === "In Progress" ? "animate-pulse" : ""}`}
                              />
                              {app.evaluationStatus}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium italic">
                              Updated: {formatDate(app.documentDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `/app/preview-application?documentNo=${app.documentNo}&status=${app.status}`,
                              )
                            }
                            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-[#00171f] px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-[#00171f] hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            <FaEye size={10} /> Preview
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10}>
                        <EmptyState />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* INFO FOOTER */}
            <div className="bg-gray-50/50 p-4 px-8 border-t border-gray-100 flex items-center gap-3">
              <FaInfoCircle className="text-[#00171f] opacity-50" size={14} />
              <p className="text-[11px] text-gray-500 font-bold italic tracking-wide">
                Application Status tracks your document workflow, while
                Evaluation Status reflects your progress in the vetting cycle.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
      <FaInbox size={48} />
    </div>
    <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight mb-1">
      No Applications Tracked
    </h3>
    <p className="text-[11px] text-gray-500 font-medium max-w-xs text-center">
      You haven't submitted any applications for review yet.
    </p>
  </div>
);

export default TrackApplications;
