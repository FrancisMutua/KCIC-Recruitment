import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";

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

  // Separate plain function used to refresh after add/delete
  const refreshExperiences = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/work-experience?applicationNo=${applicationNo}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await response.json();
      if (result.success) {
        setExperiences(result.data || []);
      } else {
        toast.error(result.message || "Failed to fetch work experience");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching work experience");
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
        const response = await fetch(`/api/job/work-experience?applicationNo=${applicationNo}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await response.json();
        if (cancelled) return;
        if (result.success) {
          setExperiences(result.data || []);
        } else {
          toast.error(result.message || "Failed to fetch work experience");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error("Error fetching work experience");
      } finally {
        if (!cancelled) setFetching(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [applicationNo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

    const missing = requiredFields.filter(f => !formData[f.key]);
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map(f => f.label).join(", ")}`);
      return;
    }

    // Date Validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(formData.startDate);

    if (start > today) {
      toast.error("Start Date cannot be in the future");
      return;
    }

    if (!formData.isCurrent && formData.endDate) {
      const end = new Date(formData.endDate);
      if (end <= start) {
        toast.error("End Date must be after Start Date");
        return;
      }
      if (end > today) {
        toast.error("End Date cannot be in the future for a past position. Check 'Currently Working Here' if this is your current job.");
        return;
      }
    }

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        applicationNo,
        position: formData.position,
        institution: formData.institution,
        responsibilities: formData.responsibilities,
        isCurrent: formData.isCurrent,
        startDate: formData.startDate,
        endDate: formData.isCurrent ? "0001-01-01" : formData.endDate
      };

      const response = await fetch("/api/job/add-work-experience", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
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
        refreshExperiences();
      } else {
        toast.error(result.message || result.Message || "Failed to add work experience");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error adding work experience");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lineNo) => {
    if (!window.confirm("Are you sure you want to delete this experience?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/job/delete-work-experience?applicationNo=${applicationNo}&lineNo=${lineNo}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Experience deleted");
        refreshExperiences();
      } else {
        toast.error(result.message || result.Message || "Failed to delete experience");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting experience");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddExperience} className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-navy" /> Add Work Experience
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Position <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="position" 
              value={formData.position} 
              onChange={handleChange} 
              placeholder="Enter your job title or position"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Institution / Company <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="institution" 
              value={formData.institution} 
              onChange={handleChange} 
              placeholder="Enter the name of the organization"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" 
              required 
            />
          </div>

          {!formData.isCurrent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white" 
                required 
              />
            </div>
          )}

          <div className="col-span-full">
            <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
              <input
                type="checkbox"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
                className="w-4 h-4 text-brand-navy border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Currently Working Here</span>
            </label>
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              placeholder="Briefly describe your key responsibilities (Max 500 chars)"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">{formData.responsibilities?.length || 0}/500</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 rounded-md hover:opacity-90 transition-colors flex items-center gap-2 "
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Experience"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700">Work Experience History</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Institution / Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetching ? (
                <tr>
                   <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-gray-500">
                         <IconLoader2 className="animate-spin" /> Fetching experiences...
                      </div>
                   </td>
                </tr>
              ) : experiences.filter(e => e.position || e.institution).length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-10 text-center text-gray-500 italic">
                      No work experience added yet.
                   </td>
                </tr>
              ) : (
                experiences
                  .filter(e => e.position || e.institution)
                  .map((e) => (
                  <tr key={e.lineNo} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{e.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {e.startDate} - {e.endDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(e.lineNo)}
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

export default WorkExperience;
