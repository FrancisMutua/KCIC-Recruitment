import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { validateDateRange } from "../../../../lib/dateValidation";
import { isBlank } from "../../../../lib/applicationValidation";
import { formatDate } from "../../../../lib/bcDate";
import { apiFetch, readJson } from "../../../../lib/http";

const AcademicQualifications = ({ applicationNo, onBack, onNext }) => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    course: "",
    institution: "",
    startDate: "",
    endDate: "",
    grade: "",
    courseDescription: "",
    areaOfStudy: ""
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (name, value) => {
    setFieldErrors((prev) => {
      if (name === "startDate" || name === "endDate") {
        const next = { ...prev };
        delete next.startDate;
        delete next.endDate;
        return { ...next, ...validateDateRange({ ...formData, [name]: value }, { allowFutureEnd: true, required: false }) };
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
    fieldErrors[name] ? <p id={`qualification-${name}-error`} role="alert" className="field-error">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshQualifications = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/academic-qualifications?applicationNo=${encodeURIComponent(applicationNo)}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await readJson(response);
      if (result.success) {
        setQualifications(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch academic qualifications");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error fetching academic qualifications");
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
        const response = await apiFetch(`/api/job/academic-qualifications?applicationNo=${encodeURIComponent(applicationNo)}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await readJson(response);
        if (cancelled) return;
        if (result.success) {
          setQualifications(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch academic qualifications");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error(error.message || "Error fetching academic qualifications");
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

  const handleAddQualification = async (e) => {
    e.preventDefault();

    // Required Fields Validation
    const requiredFields = [
      { key: "course", label: "Level" },
      { key: "institution", label: "Institution" },
      { key: "courseDescription", label: "Course Description" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "grade", label: "Grade" }
    ];

    const missing = requiredFields.filter(f => isBlank(formData[f.key]));
    const errors = {
      ...missing.reduce((errors, field) => {
        errors[field.key] = `${field.label} is required.`;
        return errors;
      }, {}),
      ...validateDateRange(formData, { allowFutureEnd: true })
    };
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return;
    }
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        applicationNo,
        course: formData.course,
        institution: formData.institution,
        startDate: formData.startDate,
        endDate: formData.endDate,
        grade: formData.grade,
        courseDescription: formData.courseDescription || "",
        areaOfStudy: formData.areaOfStudy || ""
      };

      const response = await apiFetch("/api/job/add-academic-qualification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Qualification added successfully");
        setFormData({
          course: "",
          institution: "",
          startDate: "",
          endDate: "",
          grade: "",
          courseDescription: "",
          areaOfStudy: ""
        });
        setFieldErrors({});
        refreshQualifications();
      } else {
        toast.error(result.message || result.Message || "Failed to add qualification");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error adding qualification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this qualification?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/delete-academic-qualification?applicationNo=${encodeURIComponent(applicationNo)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await readJson(response);
      if (result.success) {
        toast.success("Qualification deleted");
        refreshQualifications();
      } else {
        toast.error(result.message || result.Message || "Failed to delete qualification");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error deleting qualification");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddQualification} noValidate>
        <h3 className="section-title mb-4 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Academic Qualification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlobalDropdown
            source="SOAP"
            type="AcademicQualifications"
            label="Level"
            name="course"
            value={formData.course}
            onChange={(val) => updateField("course", val)}
            required
            error={fieldErrors.course}
          />

          <div>
            <label className="field-label">Institution <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="institution" 
              value={formData.institution} 
              onChange={handleChange} 
              className={inputClass("institution")} 
              maxLength={30}
              required 
            />
            {renderError("institution")}
          </div>

          <div>
            <label className="field-label">Start Date <span className="text-brand-brown-600">*</span></label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} aria-invalid={!!fieldErrors.startDate} aria-describedby={fieldErrors.startDate ? "qualification-startDate-error" : undefined} className={inputClass("startDate")} required />
            {renderError("startDate")}
          </div>

          <div>
            <label className="field-label">End Date <span className="text-brand-brown-600">*</span></label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} aria-invalid={!!fieldErrors.endDate} aria-describedby={fieldErrors.endDate ? "qualification-endDate-error" : undefined} className={inputClass("endDate")} required />
            {renderError("endDate")}
          </div>

          <div>
            <label className="field-label">Grade <span className="text-brand-brown-600">*</span></label>
            <input type="text" name="grade" value={formData.grade} onChange={handleChange} maxLength={30} className={inputClass("grade")} required />
            {renderError("grade")}
          </div>

          <div>
            <label className="field-label">Area of Study</label>
            <input type="text" name="areaOfStudy" value={formData.areaOfStudy} onChange={handleChange} maxLength={20} className={inputClass("areaOfStudy")} />
          </div>


          <div>
            <label className="field-label">Course Description <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="courseDescription" 
              value={formData.courseDescription} 
              onChange={handleChange} 
              maxLength={200}
              placeholder="Brief description (Max 200 chars)"
              className={inputClass("courseDescription")} 
              required
            />
            {renderError("courseDescription")}
            <p className="text-xs text-slate-400 mt-1">{formData.courseDescription?.length || 0}/200</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Qualification"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">My Academic Qualifications</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-left min-w-[150px]">Level</th>
                <th className="text-left min-w-[200px]">Course</th>
                <th className="text-left min-w-[200px]">Institution</th>
                <th className="text-left">Dates</th>
                <th className="text-left">Grade</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                   <td colSpan="6" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                         <IconLoader2 className="animate-spin" /> Fetching qualifications...
                      </div>
                   </td>
                </tr>
              ) : qualifications.filter(q => q.description || q.institution).length === 0 ? (
                <tr>
                   <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-500">
                      No qualifications added yet.
                   </td>
                </tr>
              ) : (
                qualifications
                  .filter(q => q.description || q.institution)
                  .map((q) => (
                  <tr key={q.id}>
                    <td>{q.code}</td>
                    <td>{q.description}</td>
                    <td>{q.institution}</td>
                    <td>
                      {formatDate(q.startDate)} – {formatDate(q.endDate)}
                    </td>
                    <td>{q.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="text-brand-brown-600 hover:text-brand-brown-700 transition-colors p-1"
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
      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <button
          onClick={onBack}
          className="btn btn-outline"
        >
          Previous
        </button>
        <button
          onClick={() => {
            onNext();
          }}
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AcademicQualifications;
