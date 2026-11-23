import { useState, useEffect } from "react";
import { isBlank } from "../../../../lib/applicationValidation";
import { toast } from "react-toastify";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { PERMANENT_RECORD_NOTE } from "../../../../lib/recruitmentApi";
import { apiFetch, readJson } from "../../../../lib/http";

const ProfessionalTraining = ({ applicationNo, onBack, onNext }) => {
  const [trainingList, setTrainingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    institution: "",
    year: ""
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
    `mt-1 block w-full border ${fieldErrors[name] ? "border-brand-camel focus:ring-brand-camel" : "border-slate-300"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-brand-brown-600">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshTraining = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/professional-training?applicationNo=${encodeURIComponent(applicationNo)}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await readJson(response);
      if (result.success) {
        setTrainingList(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch professional training");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error fetching professional training");
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
        const response = await apiFetch(`/api/job/professional-training?applicationNo=${encodeURIComponent(applicationNo)}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await readJson(response);
        if (cancelled) return;
        if (result.success) {
          setTrainingList(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch professional training");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error(error.message || "Error fetching professional training");
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
      { key: "year", label: "Year" }
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
    if (!window.confirm(`Save "${formData.description}" (${formData.institution}, ${yearNum})? This record cannot be removed later.`)) return;

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      const payload = {
        applicationNo,
        description: formData.description,
        institution: formData.institution,
        year: yearNum
      };

      const response = await apiFetch("/api/job/add-professional-training", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Professional training added successfully");
        setFormData({
          description: "",
          institution: "",
          year: ""
        });
        setFieldErrors({});
        refreshTraining();
      } else {
        toast.error(result.message || result.Message || "Failed to add professional training");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error adding professional training");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAdd} className="space-y-4" noValidate>
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Professional Training / Qualification
        </h3>
        <p className="text-sm text-slate-500 -mt-2">Add professional qualifications and training relevant to the job. Professional memberships are recorded separately under Job Requirements.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Qualification / Training Name <span className="text-brand-brown-600">*</span>
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. CPA, PMP, ACCA, Data Science Certificate"
              maxLength={100}
              className={inputClass("description")}
              required
            />
            {renderError("description")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Year Attained <span className="text-brand-brown-600">*</span>
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
            <label className="block text-sm font-medium text-slate-700">
              Institution <span className="text-brand-brown-600">*</span>
            </label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Awarding body or institution"
              maxLength={100}
              className={inputClass("institution")}
              required
            />
            {renderError("institution")}
          </div>



        </div>

        <p className="mt-4 text-sm text-brand-brown-600">{PERMANENT_RECORD_NOTE}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Training"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Professional Training & Qualifications</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Qualification / Training</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>

              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {fetching ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center">
                    <div className="flex justify-center items-center gap-2 text-slate-500">
                      <IconLoader2 className="animate-spin" /> Fetching records...
                    </div>
                  </td>
                </tr>
              ) : trainingList.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">
                    No professional training records added yet.
                  </td>
                </tr>
              ) : (
                trainingList.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-green-50/40 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.institution}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.year}</td>

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
          className="border border-slate-300 bg-white text-slate-700 font-semibold px-6 py-2 rounded-lg hover:border-brand-green hover:bg-brand-green-50 hover:text-brand-green-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default ProfessionalTraining;
