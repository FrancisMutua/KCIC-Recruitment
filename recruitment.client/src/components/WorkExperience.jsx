import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaBriefcase,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaBuilding,
  FaCalendarAlt,
  FaTimes,
  FaSave,
  FaArrowRight,
  FaHistory,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const WorkExperience = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo");

  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [count, setCount] = useState(0);

  const token = localStorage.getItem("accessToken");

  const [formData, setFormData] = useState({
    position: "",
    institution: "",
    startDate: "",
    endDate: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (exp = null) => {
    if (exp) {
      setEditingId(exp.id);
      setFormData({
        position: exp.position,
        institution: exp.institution,
        startDate: exp.startDate.split("T")[0],
        endDate: exp.endDate.split("T")[0],
      });
    } else {
      setEditingId(null);
      setFormData({
        position: "",
        institution: "",
        startDate: "",
        endDate: "",
      });
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/job/getworkexperience?documentNo=${documentNo}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const result = await response.json();
        setExperiences(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [documentNo, token, count]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start date cannot be later than end date");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...formData, id: editingId || "", documentNo, token };
      const response = await fetch("/api/job/submitworkexperience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      toast.success(editingId ? "Experience updated" : "Experience added");
      setIsModalOpen(false);
      setCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this work experience record?")) return;
    try {
      const response = await fetch(`/api/job/removeworkexperience?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Record removed");
      setExperiences((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    changeDocumentTitle("Work Experience");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaBriefcase className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#00171f] tracking-tight uppercase">
              Work <span className="text-red-600">Experience</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Provide a chronological history of your professional background.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#00171f] hover:bg-black text-white px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl"
        >
          <FaPlus size={12} /> Add Experience
        </button>
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Syncing History...
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="block md:hidden divide-y divide-gray-100">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div key={exp.id} className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-black text-[#00171f] text-sm leading-tight">
                          {exp.position}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase">
                          <FaBuilding className="text-red-600 opacity-50" />{" "}
                          {exp.institution}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(exp)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 text-red-500 bg-red-50 rounded-lg"
                        >
                          <FaTrashAlt size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="opacity-50" />{" "}
                        {formatDate(exp.startDate)}
                      </div>
                      <div className="w-4 h-[1px] bg-gray-300" />
                      <div>{formatDate(exp.endDate)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState onAdd={() => openModal()} />
              )}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Position
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Institution
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      Period
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {experiences.map((exp) => (
                    <tr
                      key={exp.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm md:text-base font-black text-gray-700 group-hover:text-red-600 transition-colors">
                          {exp.position}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-tight">
                          <FaBuilding className="text-gray-300" />{" "}
                          {exp.institution}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <FaCalendarAlt className="text-red-600 opacity-50" />
                          <span>{formatDate(exp.startDate)}</span>
                          <span className="text-gray-300">—</span>
                          <span>{formatDate(exp.endDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(exp)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() =>
            navigate(`/app/relationships?documentNo=${documentNo}`)
          }
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-100 active:scale-95"
        >
          Next Section <FaArrowRight size={12} />
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#00171f]/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm md:text-base font-black text-[#00171f] uppercase tracking-tight">
                {editingId ? "Edit" : "Add"}{" "}
                <span className="text-red-600">Experience</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-600"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-6 md:p-8 space-y-4 md:space-y-5"
            >
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Job Position
                </label>
                <div className="relative group">
                  <FaBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors" />
                  <input
                    required
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                  Institution / Company
                </label>
                <div className="relative group">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors" />
                  <input
                    required
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="e.g. Google Kenya"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl outline-none font-medium text-sm text-gray-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <FaSave size={14} /> Save Experience
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
      <FaHistory size={48} />
    </div>
    <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight mb-1">
      No Experience Records
    </h3>
    <p className="text-xs text-gray-400 max-w-[250px] mx-auto mb-6 font-medium">
      Your professional timeline is currently empty. Add your previous roles to
      proceed.
    </p>
    <button
      onClick={onAdd}
      className="text-red-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-red-600 pb-0.5 transition-colors"
    >
      Create First Entry
    </button>
  </div>
);

export default WorkExperience;
