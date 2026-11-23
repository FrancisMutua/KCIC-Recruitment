import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react";
import GlobalDropdown from "../../../../components/ui/GlobalDropdown";
import { apiFetch, readJson } from "../../../../lib/http";

const NextOfKin = ({ applicationNo, onBack, onNext }) => {
  const [kinList, setKinList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNo: "",
    email: "",
    relationship: "",
    institution: ""
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

  const inputClass = (name) =>
    `field-input ${fieldErrors[name] ? "field-input-error" : ""} bg-white`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="field-error">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshKin = async () => {
    try {
      setFetching(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/relationships?applicationNo=${applicationNo}`, {
        headers: { "Authorization": `Bearer ${user.accessToken}` }
      });
      const result = await readJson(response);
      if (result.success) {
        const filtered = (result.data || []).filter(item => item.type === "Next of Kin");
        setKinList(filtered);
      } else {
        toast.error(result.message || "Failed to fetch Next of Kin");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error fetching Next of Kin");
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
        const response = await apiFetch(`/api/job/relationships?applicationNo=${applicationNo}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        });
        const result = await readJson(response);
        if (cancelled) return;
        if (result.success) {
          const filtered = (result.data || []).filter(item => item.type === "Next of Kin");
          setKinList(filtered);
        } else {
          toast.error(result.message || "Failed to fetch Next of Kin");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error(error.message || "Error fetching Next of Kin");
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

  const handleAddKin = async (e) => {
    e.preventDefault();

    // Required Fields Validation
    const requiredFields = [
      { key: "firstName", label: "First Name" },
      { key: "middleName", label: "Middle Name" },
      { key: "lastName", label: "Last Name" },
      { key: "phoneNo", label: "Phone Number" },
      { key: "email", label: "Email Address" },
      { key: "relationship", label: "Relationship" },
      { key: "institution", label: "Institution" }
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

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        type: "nok",
        applicationNo,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phoneNo: parseInt(formData.phoneNo) || 0,
        email: formData.email,
        relationship: formData.relationship,
        institution: formData.institution
      };

      const response = await apiFetch("/api/job/add-relationship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Next of Kin added successfully");
        setFormData({
            firstName: "",
            middleName: "",
            lastName: "",
            phoneNo: "",
            email: "",
            relationship: "",
            institution: ""
        });
        setFieldErrors({});
        refreshKin();
      } else {
        toast.error(result.message || result.Message || "Failed to add Next of Kin");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error adding Next of Kin");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const response = await apiFetch(`/api/job/delete-relationship?id=${id}&applicationNo=${applicationNo}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      const result = await readJson(response);
      if (result.success) {
        toast.success("Record deleted");
        refreshKin();
      } else {
        toast.error(result.message || result.Message || "Failed to delete record");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error deleting record");
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddKin} className="space-y-4" noValidate>
        <h3 className="section-title mb-4 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Next of Kin
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="field-label">First Name <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="Enter first name"
              className={inputClass("firstName")} 
              required 
            />
            {renderError("firstName")}
          </div>

          <div>
            <label className="field-label">Middle Name <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="middleName" 
              value={formData.middleName} 
              onChange={handleChange} 
              placeholder="Enter middle name"
              className={inputClass("middleName")} 
              required
            />
            {renderError("middleName")}
          </div>

          <div>
            <label className="field-label">Last Name <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Enter last name"
              className={inputClass("lastName")} 
              required 
            />
            {renderError("lastName")}
          </div>

          <div>
            <label className="field-label">Phone Number <span className="text-brand-brown-600">*</span></label>
            <input 
              type="number" 
              name="phoneNo" 
              value={formData.phoneNo} 
              onChange={handleChange} 
              placeholder="e.g. 0712345678"
              className={inputClass("phoneNo")} 
              required 
            />
            {renderError("phoneNo")}
          </div>

          <div>
            <label className="field-label">Email Address <span className="text-brand-brown-600">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="e.g. jane.doe@example.com"
              className={inputClass("email")} 
              required 
            />
            {renderError("email")}
          </div>

          <div>
            <label className="field-label">Relationship <span className="text-brand-brown-600">*</span></label>
            <input 
              type="text" 
              name="relationship" 
              value={formData.relationship} 
              onChange={handleChange} 
              placeholder="e.g. Spouse, Parent, Sibling"
              className={inputClass("relationship")} 
              required 
            />
            {renderError("relationship")}
          </div>

          <div>
            <label className="field-label">Institution <span className="text-brand-brown-600">*</span></label>
            <input
              type="text"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="Enter institution or organization"
              className={inputClass("institution")}
              required
            />
            {renderError("institution")}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Next of Kin"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="section-title">Next of Kin Details</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Contact</th>
                <th className="text-left">Relationship</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                   <td colSpan="4" className="px-6 py-10 text-center">
                      <div className="flex justify-center items-center gap-2 text-slate-500">
                         <IconLoader2 className="animate-spin" /> Fetching records...
                      </div>
                   </td>
                </tr>
              ) : kinList.length === 0 ? (
                <tr>
                   <td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500">
                      No Next of Kin details added yet.
                   </td>
                </tr>
              ) : (
                kinList.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-slate-900">
                        {item.firstName} {item.middleName} {item.lastName}
                    </td>
                    <td>
                        <div>{item.phoneNo}</div>
                        <div className="text-xs text-slate-400">{item.email}</div>
                    </td>
                    <td>
                      {item.relationship}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(item.id)}
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

export default NextOfKin;
