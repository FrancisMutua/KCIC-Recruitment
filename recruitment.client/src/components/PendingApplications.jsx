import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEdit,
  FaTrashAlt,
  FaFileSignature,
  FaCalendarAlt,
  FaSearch,
  FaInbox,
} from "react-icons/fa";
import { useApplications } from "../hooks/useApplications";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const PendingApplications = () => {
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

  const filteredDrafts = applications
    .filter(
      (draft) =>
        draft.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((draft) => draft.status === "Open");

  useEffect(function () {
    changeDocumentTitle("Pending Applications");
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
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaFileSignature className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight">
              Application <span className="text-red-600">Drafts</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Continue where you left off. These applications have not yet been
            submitted.
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search by job title or reference..."
            className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      {isLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Spinner />
          <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
            Fetching drafts...
          </p>
        </div>
      )}
      {!isLoading && (
        <>
          {/* MOBILE LIST VIEW (Visible on small screens) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredDrafts.length > 0 ? (
              filteredDrafts.map((draft) => (
                <div
                  key={draft.documentNo}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase">
                      {draft.documentNo}
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border border-yellow-100">
                      {draft.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-[#00171f] leading-tight">
                      {draft.jobTitle}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      Ref: {draft.referenceNo}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 font-bold">
                      <FaCalendarAlt className="opacity-50" />
                      {formatDate(draft.documentDate)}
                    </div>
                    <div className="text-[9px] font-black text-blue-600 uppercase">
                      Eval: {draft.evaluationStatus}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/app/minimum-requirements?documentNo=${draft.documentNo}`,
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-[#00171f] text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      <FaEdit /> Resume
                    </button>
                    <button className="p-3 text-gray-400 bg-gray-50 rounded-xl hover:text-red-600 transition-colors">
                      <FaTrashAlt size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </div>

          {/* DESKTOP TABLE VIEW (Visible on md screens and up) */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      App No.
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Job Details
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Created
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Workflow
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDrafts.length > 0 ? (
                    filteredDrafts.map((draft) => (
                      <tr
                        key={draft.documentNo}
                        className="hover:bg-gray-50/50 transition-all group cursor-pointer"
                      >
                        <td className="px-6 py-5">
                          <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase">
                            {draft.documentNo}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm md:text-base font-black text-[#00171f] group-hover:text-red-600 transition-colors">
                              {draft.jobTitle}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                              ID: {draft.referenceNo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium whitespace-nowrap">
                            <FaCalendarAlt className="text-gray-300" />
                            {formatDate(draft.documentDate)}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-yellow-100 w-fit">
                              Status: {draft.status}
                            </span>
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-blue-100 w-fit">
                              Eval: {draft.evaluationStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/app/minimum-requirements?documentNo=${draft.documentNo}`,
                                )
                              }
                              className="flex items-center gap-2 bg-[#00171f] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-black transition-all shadow-md active:scale-95 whitespace-nowrap"
                            >
                              <FaEdit size={10} /> Resume
                            </button>
                            <button className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                              <FaTrashAlt size={12} />
                            </button>
                          </div>
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

            {/* TABLE FOOTER */}
            <div className="bg-gray-50/50 p-4 px-8 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">
                * Note: Applications in "Open" status are only visible to you.
                Recruiters cannot see your application until you click 'Submit'.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-10">
    <div className="bg-gray-50 p-6 md:p-8 rounded-full mb-6">
      <FaInbox className="text-4xl md:text-6xl text-gray-200" />
    </div>
    <h3 className="text-base md:text-lg font-black text-[#00171f] uppercase tracking-tight mb-1 text-center">
      No Drafts Found
    </h3>
    <p className="text-xs md:text-sm text-gray-500 font-medium max-w-xs mx-auto text-center">
      Visit the vacancies page to start a new application.
    </p>
  </div>
);

export default PendingApplications;
