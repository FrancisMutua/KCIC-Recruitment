import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaInbox,
  FaEye,
  FaInfoCircle,
  FaAward,
  FaHandshake,
  FaFileSignature,
  FaCalendarAlt,
  FaFilePdf,
  FaTimesCircle,
  FaBan,
} from "react-icons/fa";
import { useApplications } from "../hooks/useApplications";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";
import { toast } from "react-toastify";

const Recommendation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { applications, isLoading, refreshApplications } = useApplications();

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const applicationsToRecommend = applications
    .filter(
      (app) =>
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((app) => app.recommend === true);

  const handleDownloadOfferLetter = async (app) => {
    const toastId = toast.loading("Generating your official offer letter...");
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/job/generateofferletter?documentNo=${app.documentNo}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      const linkSource = `data:application/pdf;base64,${result.base64Data}`;
      const downloadLink = document.createElement("a");
      downloadLink.href = linkSource;
      downloadLink.download = result.fileName;
      downloadLink.click();

      toast.update(toastId, {
        render: "Offer letter downloaded!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      toast.update(toastId, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleAcceptPlacement = async (app) => {
    if (
      !window.confirm(
        `Are you sure you want to formally accept the placement for ${app.jobTitle}?`,
      )
    )
      return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/job/acceptrecommendation?documentNo=${app.documentNo}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      refreshApplications();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPlacement = async (app) => {
    if (
      !window.confirm(
        `Are you sure you want to REJECT the offer for ${app.jobTitle}? This action is permanent.`,
      )
    )
      return;
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/job/rejectrecommendation?documentNo=${app.documentNo}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
      toast.warning("Offer formally declined.");
      refreshApplications();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    changeDocumentTitle("Job Recommendations");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaAward className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight uppercase">
              Placement <span className="text-red-600">Offers</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14 max-w-2xl">
            Congratulations! You have been recommended for the following
            positions. Please review and confirm your acceptance.
          </p>
        </div>

        <div className="relative w-full max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
          <input
            type="text"
            placeholder="Search offers..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#00171f] outline-none transition-all text-sm font-medium"
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
            Syncing Records...
          </p>
        </div>
      ) : (
        <>
          {/* MOBILE LIST VIEW */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {applicationsToRecommend.map((app) => (
              <div
                key={app.documentNo}
                className={`bg-white p-5 rounded-3xl border-2 shadow-sm space-y-4 relative overflow-hidden ${app.recommendationAccepted ? "border-gray-100" : "border-red-50"}`}
              >
                <div
                  className={`absolute top-0 right-0 p-2 text-white rounded-bl-xl font-black text-[8px] uppercase tracking-widest ${app.recommendationAccepted ? "bg-[#00171f]" : "bg-red-600"}`}
                >
                  {app.recommendationAccepted ? "Closed" : "Offer Active"}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
                    {app.documentNo}
                  </span>
                  <h3 className="text-base font-black text-[#00171f] leading-tight">
                    {app.jobTitle}
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Logic for Mobile Actions */}
                  {app.recommendationAccepted === false ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={isProcessing}
                        onClick={() => handleRejectPlacement(app)}
                        className="bg-white border border-red-200 text-red-600 py-3 rounded-xl font-black text-xs uppercase active:scale-95 transition-all"
                      >
                        Reject
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => handleAcceptPlacement(app)}
                        className="bg-red-600 text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  ) : app.evaluationStatus === "Accepted Offer" ? (
                    <button
                      onClick={() => handleDownloadOfferLetter(app)}
                      className="w-full bg-[#00171f] text-white py-3 rounded-xl font-black text-xs uppercase shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FaFilePdf /> Download Letter
                    </button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase border border-red-100 italic">
                      <FaBan /> Offer Formally Declined
                    </div>
                  )}
                  <button
                    onClick={() =>
                      navigate(
                        `/app/preview-application?documentNo=${app.documentNo}&status=${app.status}`,
                      )
                    }
                    className="w-full bg-gray-50 text-gray-400 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Ref No
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Position Details
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Placement Status
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applicationsToRecommend.map((app) => (
                    <tr
                      key={app.documentNo}
                      className="hover:bg-red-50/20 transition-all group cursor-pointer"
                    >
                      <td className="px-6 py-5 font-mono text-sm font-bold text-gray-400">
                        {app.documentNo}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm md:text-base font-black text-[#00171f] group-hover:text-red-600 transition-colors uppercase leading-none">
                            {app.jobTitle}
                          </span>
                          <span className="text-[9px] text-gray-400 font-bold uppercase mt-1.5 italic">
                            Placement Date: {formatDate(app.documentDate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 w-fit 
                          ${app.recommendationAccepted ? (app.evaluationStatus === "Accepted Offer" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100") : "bg-blue-50 text-blue-700 border-blue-100"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full bg-current ${!app.recommendationAccepted ? "animate-pulse" : ""}`}
                          />
                          {app.recommendationAccepted
                            ? app.evaluationStatus === "Accepted Offer"
                              ? "Accepted"
                              : "Declined"
                            : "Pending Offer"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/app/preview-application?documentNo=${app.documentNo}&status=${app.status}`,
                              )
                            }
                            className="p-2.5 text-gray-300 hover:text-[#00171f] transition-all"
                          >
                            <FaEye size={16} />
                          </button>

                          {/* Desktop Decision Logic */}
                          {app.recommendationAccepted === false ? (
                            <>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleRejectPlacement(app)}
                                className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-red-50 transition-all"
                              >
                                <FaTimesCircle /> Reject
                              </button>
                              <button
                                disabled={isProcessing}
                                onClick={() => handleAcceptPlacement(app)}
                                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
                              >
                                <FaHandshake size={14} /> Accept Offer
                              </button>
                            </>
                          ) : app.evaluationStatus === "Accepted Offer" ? (
                            <button
                              onClick={() => handleDownloadOfferLetter(app)}
                              className="flex items-center gap-2 bg-[#00171f] text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-black transition-all active:scale-95 shadow-md"
                            >
                              <FaFilePdf /> Download Letter
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 px-4 py-2 text-red-600 font-black text-[10px] uppercase bg-red-50 rounded-xl border border-red-100 shadow-inner select-none">
                              <FaBan /> Offer Declined
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50/50 p-4 px-8 border-t border-gray-100 flex items-center gap-3">
              <FaInfoCircle className="text-[#00171f] opacity-50" size={14} />
              <p className="text-[11px] text-gray-500 font-bold italic tracking-wide">
                Final decisions regarding placements are recorded permanently in
                the recruitment registry.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
      <FaFileSignature size={48} />
    </div>
    <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight mb-1">
      No Offers Found
    </h3>
    <p className="text-[11px] text-gray-500 font-medium max-w-xs mx-auto">
      Job placement recommendations will appear here after the shortlisting
      cycle is completed.
    </p>
  </div>
);

export default Recommendation;
