import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaPaperclip,
  FaArrowLeft,
  FaPaperPlane,
  FaInfoCircle,
  FaFilePdf,
  FaFileAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const PreviewApplication = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo");
  const status = searchParams.get("status");
  const token = localStorage.getItem("accessToken");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [declaration, setDeclaration] = useState(false);

  useEffect(() => {
    const fetchFullPreview = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/job/getfullapplicationpreview?documentNo=${documentNo}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        setApplicationData(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFullPreview();
  }, [documentNo, token]);

  const handleSubmit = async () => {
    if (!declaration) {
      toast.warning("Please accept the declaration before submitting.");
      return;
    }
    if (!window.confirm("Submit application? This action cannot be undone."))
      return;

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/job/finalsubmitapplication?documentNo=${documentNo}&token=${token}&requestLink=${window.location.origin}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      toast.success("Application submitted successfully!");
      navigate(`/app/thank-you?documentNo=${documentNo}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    changeDocumentTitle("Review Application");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  if (!applicationData) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg">
              <FaCheckCircle className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-xl md:text-3xl font-black text-[#00171f] tracking-tight uppercase">
              Review <span className="text-red-600">Application</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Application Ref:{" "}
            <span className="font-bold text-gray-800 uppercase">
              {documentNo}
            </span>{" "}
            &bull; Verify your details before final submission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: PRIMARY INFO */}
        <div className="xl:col-span-2 space-y-6">
          {/* SECTION: ACADEMIC QUALIFICATIONS */}
          <SectionCard
            title="Academic Qualifications"
            icon={<FaGraduationCap />}
          >
            {applicationData.qualifications?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {applicationData.qualifications.map((q, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-black text-gray-800 text-sm">
                      {q.description}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                      {q.institution} &bull; {q.code}
                    </p>
                    <div className="mt-1 inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-black uppercase">
                      Grade: {q.grade}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionMsg />
            )}
          </SectionCard>

          {/* SECTION: WORK EXPERIENCE */}
          <SectionCard title="Work Experience" icon={<FaBriefcase />}>
            {applicationData.experience?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {applicationData.experience.map((e, i) => (
                  <div key={i} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-black text-gray-800 text-sm">
                      {e.position}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">
                      {e.institution}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1 font-black uppercase tracking-widest">
                      {new Date(e.startDate).getFullYear()} —{" "}
                      {new Date(e.endDate).getFullYear()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptySectionMsg />
            )}
          </SectionCard>

          {/* SECTION: REFEREES & KIN */}
          <SectionCard title="References & Relationships" icon={<FaUsers />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="text-[9px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] border-b border-gray-50 pb-1">
                  Next of Kin
                </h5>
                {applicationData.kin.length > 0 ? (
                  <div className="space-y-3">
                    {applicationData.kin.map((k) => (
                      <div
                        className="bg-gray-50/50 border border-gray-100 p-3 rounded-xl"
                        key={k.id}
                      >
                        <p className="font-black text-gray-800 text-xs">
                          {k.firstName} {k.lastName}
                        </p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          {k.phoneNo}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs italic text-gray-400">
                    Not provided
                  </span>
                )}
              </div>
              <div>
                <h5 className="text-[9px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] border-b border-gray-50 pb-1">
                  Referees
                </h5>
                <p className="text-xs font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 inline-block">
                  {applicationData.referees?.length || 0} Referees Documented
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN: DOCUMENTS & SUBMISSION */}
        <div className="space-y-6">
          {/* SECTION: ATTACHMENTS */}
          <SectionCard title="Documents" icon={<FaPaperclip />}>
            <div className="space-y-2">
              {applicationData.attachments?.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  {file.fileExtension === "pdf" ? (
                    <FaFilePdf className="text-red-500" />
                  ) : (
                    <FaFileAlt className="text-blue-500" />
                  )}
                  <span className="text-xs font-bold text-gray-700 truncate">
                    {file.fileName}
                  </span>
                </div>
              ))}
              {applicationData.attachments?.length === 0 && <EmptySectionMsg />}
            </div>
          </SectionCard>

          {/* FINAL DECLARATION CARD */}
          {status === "Open" && (
            <div className="bg-[#00171f] text-white p-6 md:p-8 rounded-[2rem] shadow-2xl space-y-6">
              <div className="flex items-start gap-3 text-red-400">
                <FaExclamationTriangle className="mt-1 flex-shrink-0 text-sm" />
                <h3 className="text-xs font-black uppercase tracking-widest">
                  Final Declaration
                </h3>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed italic font-medium">
                I certify that the information provided in this application is
                true and complete. I understand that any false statement is
                grounds for automatic disqualification.
              </p>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-600 bg-transparent text-red-600 focus:ring-red-500 accent-red-600"
                  checked={declaration}
                  onChange={(e) => setDeclaration(e.target.checked)}
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors">
                  I Accept & Confirm
                </span>
              </label>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 disabled:bg-gray-700"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <FaPaperPlane className="inline mr-2" /> Submit Application
                  </>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 text-gray-400 hover:text-gray-800 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
          >
            <FaArrowLeft size={10} />{" "}
            {status === "Open" ? "Back to Attachments" : "Return"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- Helper Reusable Components --- */

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
      <span className="text-red-600 text-xs">{icon}</span>
      <h3 className="text-[10px] md:text-xs font-black text-[#00171f] uppercase tracking-[0.2em]">
        {title}
      </h3>
    </div>
    <div className="p-6 md:p-8">{children}</div>
  </div>
);

const EmptySectionMsg = () => (
  <div className="flex items-center gap-2 text-gray-400 italic text-xs py-2">
    <FaInfoCircle size={12} /> No records available.
  </div>
);

export default PreviewApplication;
