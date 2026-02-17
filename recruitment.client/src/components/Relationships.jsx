import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaUsers,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaPhone,
  FaEnvelope,
  FaUserTie,
  FaHeart,
  FaUniversity,
  FaCalendarAlt,
  FaTimes,
  FaSave,
  FaArrowRight,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import Spinner from "./Spinner";
import { changeDocumentTitle } from "../scripts/script";

const Relationships = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentNo = searchParams.get("documentNo");
  const token = localStorage.getItem("accessToken");

  const [activeTab, setActiveTab] = useState("kin");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [count, setCount] = useState(0);

  const [data, setData] = useState({ kin: [], relatives: [], referees: [] });
  const [formData, setFormData] = useState({});

  const relationshipOptions = [
    "Parent",
    "Spouse",
    "Sibling",
    "Child",
    "Guardian",
    "Cousin",
    "Other",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/job/getrelationships?documentNo=${documentNo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const result = await response.json();
        const nextOfKin = result.filter((item) => item.type === "Next of Kin");
        const relatives = result.filter((item) => item.type === "Relatives");
        const referees = result.filter((item) => item.type === "Referees");
        setData({ kin: nextOfKin, relatives, referees });
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [documentNo, token, count]);

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        phoneNo: "",
        email: "",
        birthDate: "",
        institution: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        type: activeTab,
        documentNo,
        token,
        birthDate: formData.birthDate ? formData.birthDate : new Date(),
      };
      const response = await fetch("/api/job/submitrelationship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Record saved successfully");
      setIsModalOpen(false);
      setCount((prev) => prev + 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const response = await fetch(
        `/api/job/removerelationship?id=${id}&type=${activeTab}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.message);
      toast.success("Record removed");
      setCount((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    changeDocumentTitle("Referees and Relatives");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  return (
    <div className="p-4 md:p-10 space-y-6 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 md:p-2.5 rounded-xl shadow-lg shadow-red-200">
              <FaUsers className="text-white text-lg md:text-xl" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#00171f] tracking-tight uppercase">
              Personal <span className="text-red-600">Relationships</span>
            </h1>
          </div>
          <p className="text-gray-500 text-xs md:text-sm font-medium sm:ml-14">
            Manage your Next of Kin, Relatives, and professional Referees.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#00171f] hover:bg-black text-white px-6 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl"
        >
          <FaPlus size={12} /> Add{" "}
          {activeTab === "kin"
            ? "Next of Kin"
            : activeTab === "relatives"
              ? "Relative"
              : "Referee"}
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        {[
          { id: "kin", label: "Next of Kin", icon: <FaHeart /> },
          { id: "relatives", label: "Relatives", icon: <FaUsers /> },
          { id: "referees", label: "Referees", icon: <FaUserTie /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? "bg-red-600 text-white shadow-lg shadow-red-100"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* DATA CONTAINER */}
      <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <Spinner />
            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
              Syncing History...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Full Name
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    {activeTab === "referees" ? "Institution" : "Relationship"}
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    Contact Details
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data[activeTab]?.length > 0 ? (
                  data[activeTab].map((item) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="text-sm md:text-base font-black text-gray-700 group-hover:text-red-600 transition-colors uppercase tracking-tight">
                          {item.firstName} {item.middleName} {item.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                          {activeTab === "referees"
                            ? item.institution
                            : item.relationship}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-2">
                            <FaPhone
                              className="text-red-600 opacity-50"
                              size={10}
                            />{" "}
                            {item.phoneNo}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaEnvelope
                              className="text-gray-400 opacity-50"
                              size={10}
                            />{" "}
                            {item.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <EmptyState onAdd={() => openModal()} type={activeTab} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-black font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate(`/app/attachments?documentNo=${documentNo}`)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl active:scale-95"
        >
          Attachments <FaArrowRight size={12} />
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#00171f]/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl animate-in zoom-in duration-300">
            <div className="sticky top-0 bg-white p-6 border-b border-gray-100 flex justify-between items-center z-20">
              <h3 className="text-sm md:text-base font-black text-[#00171f] uppercase tracking-tight">
                {editingId ? "Edit" : "Add"}{" "}
                <span className="text-red-600">
                  {activeTab.replace("kin", "Next of Kin")}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <ModalInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
                placeholder="Enter first name"
              />
              <ModalInput
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) =>
                  setFormData({ ...formData, middleName: e.target.value })
                }
                placeholder="Optional"
              />
              <ModalInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
                placeholder="Enter last name"
              />

              {activeTab === "referees" ? (
                <ModalInput
                  label="Institution"
                  icon={<FaUniversity />}
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  required
                  placeholder="Company or University"
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                    Relationship
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 outline-none font-medium text-sm transition-all"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Category</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <ModalInput
                label="Phone Number"
                value={formData.phoneNo}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNo: e.target.value })
                }
                required
                placeholder="e.g. 0712..."
              />
              <ModalInput
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="email@example.com"
              />

              {activeTab === "kin" && (
                <ModalInput
                  label="Birth Date"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  required
                />
              )}

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-100 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <FaSave size={14} /> Save {activeTab}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ onAdd, type }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="bg-gray-50 p-8 rounded-full mb-6 text-gray-200">
      <FaUsers size={48} />
    </div>
    <h3 className="text-base font-black text-[#00171f] uppercase tracking-tight mb-1">
      No {type} Found
    </h3>
    <p className="text-xs text-gray-500 mb-6">
      Complete your profile by adding relevant {type}.
    </p>
    <button
      onClick={onAdd}
      className="text-red-600 font-black text-[10px] uppercase tracking-widest border-b-2 border-red-600 pb-0.5 transition-colors"
    >
      Add New Record
    </button>
  </div>
);

const ModalInput = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-600 transition-colors">
          {icon}
        </div>
      )}
      <input
        className={`w-full ${icon ? "pl-11" : "px-4"} pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm`}
        {...props}
      />
    </div>
  </div>
);

export default Relationships;
