import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { PERMANENT_RECORD_NOTE } from "../../../../lib/recruitmentApi";
import { validateDateRange } from "../../../../lib/dateValidation";
import { isBlank } from "../../../../lib/applicationValidation";
import { formatDate } from "../../../../lib/bcDate";
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
    `field-input ${fieldErrors[name] ? "field-input-error" : ""} ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p id={`experience-${name}-error`} role="alert" className="field-error">{fieldErrors[name]}</p> : null;

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
        <h3 className="section-title mb-4 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Work Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <label className="field-label">Position <span className="text-brand-brown-600">*</span></label>
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
            <label className="field-label">Institution / Company <span className="text-brand-brown-600">*</span></label>
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
            <label className="field-label">Start Date <span className="text-brand-brown-600">*</span></label>
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
              <label className="field-label">End Date <span className="text-brand-brown-600">*</span></label>
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
              <span className="field-label">Currently Working Here</span>
            </label>
          </div>

        </div>

        <p className="alert alert-warn mt-4">{PERMANENT_RECORD_NOTE}</p>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Experience"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Work Experience History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-left min-w-[200px]">Position</th>
                <th className="text-left min-w-[200px]">Institution / Company</th>
                <th className="text-left">Dates</th>
              </tr>
            </thead>
            <tbody>
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
                   <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-500">
                      No work experience added yet.
                   </td>
                </tr>
              ) : (
                experiences
                  .filter(e => e.position || e.institution)
                  .map((e) => (
                  <tr key={`${e.institution}-${e.position}`}>
                    <td className="font-medium text-slate-900">{e.position}</td>
                    <td>{e.institution}</td>
                    <td>
                      {formatDate(e.startDate)} – {e.isCurrentPosition || !e.endDate ? "Present" : formatDate(e.endDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          className="btn btn-outline"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WorkExperience;
