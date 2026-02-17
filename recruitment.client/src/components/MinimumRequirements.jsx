import { useEffect, useState } from "react";
import {
  FaCheckDouble,
  FaInfoCircle,
  FaSave,
  FaChevronDown,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { FaArrowLeft, FaClipboardList } from "react-icons/fa6";
import { useNavigate, useSearchParams } from "react-router-dom";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const MinimumRequirements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo");

  const [requirements, setRequirements] = useState([]);
  const [isRequirementLoading, setIsRequirementLoading] = useState(false);

  const handleStatusChange = (code, value) => {
    setRequirements((prev) =>
      prev.map((req) => (req.code === code ? { ...req, has: value } : req)),
    );
  };

  const handleSave = async () => {
    if (requirements.some((r) => r.has === 0)) {
      toast.warning("Please answer all minimum requirements.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      setLoading(true);
      const updatedRequirements = requirements.map((req) => ({
        ...req,
        documentNo,
      }));

      const response = await fetch(
        `/api/job/updateminimumrequirements?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedRequirements),
        },
      );
      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
      toast.success(result.message);
      navigate(`/app/academic-qualifications?documentNo=${documentNo}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getRequirements = async function () {
      try {
        setIsRequirementLoading(true);
        const response = await fetch(
          `/api/job/getminimumrequirements?documentNo=${documentNo}`,
        );
        const result = await response.json();
        setRequirements(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsRequirementLoading(false);
      }
    };
    getRequirements();
  }, [documentNo]);

  useEffect(function () {
    changeDocumentTitle("Minimum Requirements");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-8 animate-in fade-in duration-700 bg-gray-50/30 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaCheckDouble className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#00171f] tracking-tight uppercase">
              Minimum <span className="text-red-600">Requirements</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Please confirm your eligibility by answering the mandatory criteria
            below.
          </p>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {isRequirementLoading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Fetching requirements...
            </p>
          </div>
        )}

        {!isRequirementLoading && (
          <div className="w-full">
            {requirements.length > 0 ? (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Code
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          Requirement Description
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {requirements.map((req) => (
                        <tr
                          key={req.code}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <span className="text-[11px] font-mono font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-100 uppercase">
                              {req.code}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-gray-700 leading-relaxed font-medium">
                              {req.description}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <RequirementSelect
                              value={req.has}
                              onChange={(val) =>
                                handleStatusChange(req.code, val)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD VIEW */}
                <div className="block md:hidden divide-y divide-gray-100">
                  {requirements.map((req) => (
                    <div key={req.code} className="p-5 space-y-3">
                      <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
                        {req.code}
                      </span>
                      <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                        {req.description}
                      </p>
                      <RequirementSelect
                        value={req.has}
                        onChange={(val) => handleStatusChange(req.code, val)}
                        isFullWidth
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* EMPTY STATE */
              <div className="py-16 md:py-32 text-center px-6">
                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
                  <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
                    <FaClipboardList className="text-5xl" />
                  </div>
                  <div className="max-w-md mx-auto">
                    <h3 className="text-base md:text-lg font-black text-[#00171f] uppercase tracking-tight mb-1">
                      No Requirements Found
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      There are currently no specific requirements listed for
                      this position.
                    </p>
                    <button
                      onClick={() => navigate(-1)}
                      className="mt-6 text-[10px] font-black text-red-600 uppercase tracking-widest hover:text-red-700 flex items-center justify-center gap-1 mx-auto border-b border-red-600 pb-0.5"
                    >
                      <FaArrowLeft size={10} /> Go Back
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INFO FOOTER */}
        <div className="bg-blue-50/50 p-4 md:p-6 px-6 md:px-8 border-t border-gray-100 flex items-start gap-3">
          <FaInfoCircle
            className="text-blue-500 mt-0.5 flex-shrink-0"
            size={14}
          />
          <p className="text-[11px] text-blue-700 font-bold leading-relaxed italic tracking-wide">
            Note: Providing false information regarding minimum requirements may
            lead to automatic disqualification from the recruitment process.
          </p>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 disabled:bg-gray-400"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <FaSave size={14} /> Save & Continue
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const RequirementSelect = ({ value, onChange, isFullWidth = false }) => (
  <div
    className={`relative inline-block ${isFullWidth ? "w-full" : "w-full max-w-[12rem]"}`}
  >
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full appearance-none px-4 py-2.5 rounded-xl border font-black text-[10px] md:text-xs uppercase tracking-widest outline-none transition-all cursor-pointer
      ${
        value === 0
          ? "bg-gray-50 border-gray-200 text-gray-400"
          : value === 2
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
      }
      focus:ring-4 focus:ring-red-500/10`}
    >
      <option value="0">Select Response</option>
      <option value="1">No (Not Met)</option>
      <option value="2">Yes (Met)</option>
    </select>
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[8px] opacity-50">
      <FaChevronDown />
    </div>
  </div>
);

export default MinimumRequirements;
