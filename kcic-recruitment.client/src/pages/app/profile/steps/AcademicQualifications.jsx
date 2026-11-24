import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { validateDateRange } from "../../../../lib/dateValidation";
import { isBlank } from "../../../../lib/applicationValidation";
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
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-slate-300"} rounded-lg shadow-sm px-3 py-2.5 ${extra}`;

  const renderError = (name) =>
    fieldErrors[name] ? <p id={`qualification-${name}-error`} role="alert" className="mt-1 text-xs text-red-600">{fieldErrors[name]}</p> : null;

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
      <form onSubmit={handleAddQualification} className="" noValidate>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
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
            <label className="block text-sm font-medium text-slate-700">Institution <span className="text-red-600">*</span></label>
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
            <label className="block text-sm font-medium text-slate-700">Start Date <span className="text-red-600">*</span></label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} aria-invalid={!!fieldErrors.startDate} aria-describedby={fieldErrors.startDate ? "qualification-startDate-error" : undefined} className={inputClass("startDate")} required />
            {renderError("startDate")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">End Date <span className="text-red-600">*</span></label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} aria-invalid={!!fieldErrors.endDate} aria-describedby={fieldErrors.endDate ? "qualification-endDate-error" : undefined} className={inputClass("endDate")} required />
            {renderError("endDate")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Grade <span className="text-red-600">*</span></label>
            <input type="text" name="grade" value={formData.grade} onChange={handleChange} maxLength={30} className={inputClass("grade")} required />
            {renderError("grade")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Area of Study</label>
            <input type="text" name="areaOfStudy" value={formData.areaOfStudy} onChange={handleChange} maxLength={20} className={inputClass("areaOfStudy")} />
          </div>


          <div>
            <label className="block text-sm font-medium text-slate-700">Course Description <span className="text-red-600">*</span></label>
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
            className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 "
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Qualification"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">My Academic Qualifications</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[150px]">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[200px]">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider min-w-[200px]">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
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
                   <td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">
                      No qualifications added yet.
                   </td>
                </tr>
              ) : (
                qualifications
                  .filter(q => q.description || q.institution)
                  .map((q) => (
                  <tr key={q.id} className="hover:bg-brand-green-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{q.code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{q.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{q.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {q.startDate} - {q.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{q.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(q.id)}
                        className="text-red-600 hover:text-red-700 transition-colors p-1"
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
          className="border border-slate-300 bg-white text-slate-700 font-semibold px-6 py-2 rounded-lg hover:border-brand-green hover:bg-brand-green-50 hover:text-brand-green-700 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => {
            onNext();
          }}
          className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default AcademicQualifications;
