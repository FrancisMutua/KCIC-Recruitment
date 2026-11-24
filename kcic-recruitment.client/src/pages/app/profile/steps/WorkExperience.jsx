import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { PERMANENT_RECORD_NOTE } from "../../../../lib/recruitmentApi";
import { validateDateRange } from "../../../../lib/dateValidation";
import { isBlank } from "../../../../lib/applicationValidation";
import { apiFetch, readJson } from "../../../../lib/http";

const WorkExperience = ({ applicationNo, onBack, onNext }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    position: "",
    institution: "",
    responsibilities: "",
    isCurrent: false,
    startDate: "",
    endDate: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name, value) => {
    setFieldErrors((prev) => {
      if (name === "startDate" || name === "endDate" || name === "isCurrent") {
        const next = { ...prev };
        delete next.startDate;
        delete next.endDate;
        return { ...next, ...validateDateRange({ ...formData, [name]: value }, { required: false }) };
      }
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputClass = (name, extra = "bg-white") =>
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-slate-300"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p id={`experience-${name}-error`} role="alert" className="mt-1 text-xs text-red-600">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshExperiences = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/work-experience?applicationNo=${encodeURIComponent(applicationNo)}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await readJson(response);
      if (result.success) {
        setExperiences(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch work experience");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error fetching work experience");
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
        const response = await apiFetch(`/api/job/work-experience?applicationNo=${encodeURIComponent(applicationNo)}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await readJson(response);
        if (cancelled) return;
        if (result.success) {
          setExperiences(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch work experience");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error(error.message || "Error fetching work experience");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [applicationNo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateField(name, type === "checkbox" ? checked : value);
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();

    // Required Fields Validation
    const requiredFields = [
      { key: "position", label: "Position" },
      { key: "institution", label: "Institution" },
      { key: "startDate", label: "Start Date" },
      ...(!formData.isCurrent ? [{ key: "endDate", label: "End Date" }] : [])
    ];

    const missing = requiredFields.filter(f => isBlank(formData[f.key]));
    const errors = {
      ...missing.reduce((errors, field) => {
        errors[field.key] = `${field.label} is required.`;
        return errors;
      }, {}),
      ...validateDateRange(formData)
    };
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    if (!window.confirm(`Save "${formData.position}" at ${formData.institution}? This record cannot be removed later.`)) return;

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        applicationNo,
        position: formData.position,
        institution: formData.institution,
        isCurrent: formData.isCurrent,
        startDate: formData.startDate,
        endDate: formData.isCurrent ? null : formData.endDate
      };

      const response = await apiFetch("/api/job/add-work-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Work experience added successfully");
        setFormData({
          position: "",
          institution: "",
          responsibilities: "",
          isCurrent: false,
          startDate: "",
          endDate: ""
        });
        setFieldErrors({});
        refreshExperiences();
      } else {
        toast.error(result.message || result.Message || "Failed to add work experience");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error adding work experience");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddExperience} className="space-y-4" noValidate>
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Work Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Position <span className="text-red-600">*</span></label>
            <input 
              type="text" 
              name="position" 
              value={formData.position} 
              onChange={handleChange} 
              placeholder="Enter your job title or position"
              className={inputClass("position")} 
              required 
            />
            {renderError("position")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Institution / Company <span className="text-red-600">*</span></label>
            <input 
              type="text" 
              name="institution" 
              value={formData.institution} 
              onChange={handleChange} 
              placeholder="Enter the name of the organization"
              className={inputClass("institution")} 
              required 
            />
            {renderError("institution")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Start Date <span className="text-red-600">*</span></label>
            <input 
              type="date" 
              name="startDate" 
              aria-invalid={!!fieldErrors.startDate}
              aria-describedby={fieldErrors.startDate ? "experience-startDate-error" : undefined}
              value={formData.startDate} 
              onChange={handleChange} 
              className={inputClass("startDate")} 
              required 
            />
            {renderError("startDate")}
          </div>

          {!formData.isCurrent && (
            <div>
              <label className="block text-sm font-medium text-slate-700">End Date <span className="text-red-600">*</span></label>
              <input 
                type="date" 
                name="endDate" 
                aria-invalid={!!fieldErrors.endDate}
                aria-describedby={fieldErrors.endDate ? "experience-endDate-error" : undefined}
                value={formData.endDate} 
                onChange={handleChange} 
                className={inputClass("endDate")} 
                required 
              />
              {renderError("endDate")}
            </div>
          )}

          <div className="col-span-full">
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
                className="w-4 h-4 text-brand-green-600 border-slate-300 rounded"
              />
              <span className="text-sm font-medium text-slate-700">Currently Working Here</span>
            </label>
          </div>

        </div>

        <p className="mt-4 text-sm text-brand-grey-600">{PERMANENT_RECORD_NOTE}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 "
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Experience"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Work Experience History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[200px]">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[200px]">Institution / Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {fetching ? (
                <tr>
                   <td colSpan="3" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                         <IconLoader2 className="animate-spin" /> Fetching experiences...
                      </div>
                   </td>
                </tr>
              ) : experiences.filter(e => e.position || e.institution).length === 0 ? (
                <tr>
                   <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">
                      No work experience added yet.
                   </td>
                </tr>
              ) : (
                experiences
                  .filter(e => e.position || e.institution)
                  .map((e) => (
                  <tr key={`${e.institution}-${e.position}`} className="hover:bg-brand-green-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{e.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{e.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {e.startDate} - {e.isCurrentPosition || !e.endDate ? "Present" : e.endDate}
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

export default WorkExperience;
