import { useState, useEffect } from "react";
import { isBlank } from "../../../../lib/applicationValidation";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";

const ProfessionalTraining = ({ applicationNo, onBack, onNext }) => {
  const [trainingList, setTrainingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    institution: "",
    year: "",
    professionalMembership: "",
    trainingDescription: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name, value) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass = (name, extra = "bg-white") =>
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-gray-300"} rounded-md shadow-sm p-2 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-500">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshTraining = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/professional-training?applicationNo=${applicationNo}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setTrainingList(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch professional training");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching professional training");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (!applicationNo) return;
    let cancelled = false;
    const load = async () => {
      try {
        setFetching(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/api/job/professional-training?applicationNo=${applicationNo}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await response.json();
        if (cancelled) return;
        if (result.success) {
          setTrainingList(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch professional training");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("Error fetching professional training");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [applicationNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Required Fields Validation
    const requiredFields = [
      { key: "description", label: "Qualification / Training Name" },
      { key: "institution", label: "Institution" },
      { key: "year", label: "Year" },
      { key: "trainingDescription", label: "Training Description" }
    ];

    const missing = requiredFields.filter(f => isBlank(formData[f.key]));
    if (missing.length > 0) {
      setFieldErrors(missing.reduce((errors, field) => {
        errors[field.key] = `${field.label} is required.`;
        return errors;
      }, {}));
      toast.error(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    const yearNum = Number(formData.year);
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setFieldErrors({ year: "Please enter a valid year." });
      toast.error("Please enter a valid year");
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const payload = {
        applicationNo,
        description: formData.description,
        institution: formData.institution,
        year: yearNum,
        professionalMembership: formData.professionalMembership,
        trainingDescription: formData.trainingDescription
      };

      const response = await fetch("/api/job/add-professional-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Professional training added successfully");
        setFormData({
          description: "",
          institution: "",
          year: "",
          professionalMembership: "",
          trainingDescription: ""
        });
        setFieldErrors({});
        refreshTraining();
      } else {
        toast.error(result.message || result.Message || "Failed to add professional training");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding professional training");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lineNo) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `/api/job/delete-professional-training?applicationNo=${applicationNo}&lineNo=${lineNo}`,
        {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success("Record deleted");
        refreshTraining();
      } else {
        toast.error(result.message || result.Message || "Failed to delete record");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting record");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAdd} className="space-y-4" noValidate>
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-navy" /> Add Professional Training / Qualification
        </h3>
        <p className="text-sm text-gray-500 -mt-2">Add professional qualifications and training relevant to the job. Professional memberships are recorded separately under Job Requirements.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Qualification / Training Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. CPA, PMP, ACCA, Data Science Certificate"
              className={inputClass("description")}
              required
            />
            {renderError("description")}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Year Attained <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              placeholder={`e.g. ${new Date().getFullYear()}`}
              className={inputClass("year")}
              required
            />
            {renderError("year")}
          </div>

          <div className="col-span-full md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Awarding body or institution"
              className={inputClass("institution")}
              required
            />
            {renderError("institution")}
          </div>



          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700">Training Description <span className="text-red-500">*</span></label>
            <textarea
              name="trainingDescription"
              value={formData.trainingDescription}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="Brief description of the training or qualification (max 500 chars)"
              className={inputClass("trainingDescription", "bg-white resize-none")}
              required
            />
            {renderError("trainingDescription")}
            <p className="text-xs text-gray-400 mt-1">{formData.trainingDescription?.length || 0}/500</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors flex items-center gap-2"
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Training"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">Professional Training & Qualifications</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification / Training</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>

                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetching ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <IconLoader2 className="animate-spin" /> Fetching records...
                    </div>
                  </td>
                </tr>
              ) : trainingList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                    No professional training records added yet.
                  </td>
                </tr>
              ) : (
                trainingList.map((item) => (
                  <tr key={item.lineNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.institution}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.year}</td>

                    <td className="px-6 py-4 text-center text-sm font-medium">
                      <button
                        onClick={() => handleDelete(item.lineNo)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Delete"
                      >
                        <IconTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default ProfessionalTraining;
