import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";

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
  const refreshQualifications = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/academic-qualifications?applicationNo=${applicationNo}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setQualifications(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch academic qualifications");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching academic qualifications");
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
        const response = await fetch(`/api/job/academic-qualifications?applicationNo=${applicationNo}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await response.json();
        if (cancelled) return;
        if (result.success) {
          setQualifications(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch academic qualifications");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("Error fetching academic qualifications");
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

    const missing = requiredFields.filter(f => !formData[f.key]);
    if (missing.length > 0) {
      setFieldErrors(missing.reduce((errors, field) => {
        errors[field.key] = `${field.label} is required.`;
        return errors;
      }, {}));
      toast.error(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    // Date Validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start > today) {
      setFieldErrors({ startDate: "Start Date cannot be in the future." });
      toast.error("Start Date cannot be in the future");
      return;
    }
    if (end <= start) {
      setFieldErrors({ endDate: "End Date must be after Start Date." });
      toast.error("End Date must be after Start Date");
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

      const response = await fetch("/api/job/add-academic-qualification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
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
      toast.error("Error adding qualification");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lineNo) => {
    if (!window.confirm("Are you sure you want to delete this qualification?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/delete-academic-qualification?applicationNo=${applicationNo}&lineNo=${lineNo}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Qualification deleted");
        refreshQualifications();
      } else {
        toast.error(result.message || result.Message || "Failed to delete qualification");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting qualification");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddQualification} className="" noValidate>
        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-navy" /> Add Academic Qualification
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
            <label className="block text-sm font-medium text-gray-700">Institution <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="institution" 
              value={formData.institution} 
              onChange={handleChange} 
              className={inputClass("institution")} 
              required 
            />
            {renderError("institution")}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass("startDate")} required />
            {renderError("startDate")}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass("endDate")} required />
            {renderError("endDate")}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Grade <span className="text-red-500">*</span></label>
            <input type="text" name="grade" value={formData.grade} onChange={handleChange} className={inputClass("grade")} required />
            {renderError("grade")}
          </div>

          <GlobalDropdown source="SOAP" type="Area of Study" label="Area of Study" name="areaOfStudy" value={formData.areaOfStudy} onChange={(value) => updateField("areaOfStudy", value)} />


          <div>
            <label className="block text-sm font-medium text-gray-700">Course Description <span className="text-red-500">*</span></label>
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
            <p className="text-xs text-gray-400 mt-1">{formData.courseDescription?.length || 0}/200</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors flex items-center gap-2 "
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Qualification"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">My Academic Qualifications</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Institution</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetching ? (
                <tr>
                   <td colSpan="5" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                         <IconLoader2 className="animate-spin" /> Fetching qualifications...
                      </div>
                   </td>
                </tr>
              ) : qualifications.filter(q => q.description || q.institution).length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">
                      No qualifications added yet.
                   </td>
                </tr>
              ) : (
                qualifications
                  .filter(q => q.description || q.institution)
                  .map((q) => (
                  <tr key={q.lineNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{q.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{q.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {q.startDate} - {q.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{q.grade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(q.lineNo)}
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
          onClick={() => {
            onNext();
          }}
          className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

export default AcademicQualifications;
