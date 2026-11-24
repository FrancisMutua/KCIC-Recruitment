import { useState, useEffect } from "react";
import { isBlank } from "../../../../lib/applicationValidation";
import { toast } from "react-toastify";
import { IconPlus, IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { applicationContext, PERMANENT_RECORD_NOTE } from "../../../../lib/recruitmentApi";
import { getRefereeSubmissionStatus } from "../../../../lib/refereeValidation";
import { apiFetch, readJson } from "../../../../lib/http";

const Referees = ({ applicationNo, onBack, onNext }) => {
  const [refereesList, setRefereesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [minimumReferees, setMinimumReferees] = useState(undefined);
  const [formData, setFormData] = useState({
    firstName: "",
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
    `mt-1 block w-full border ${fieldErrors[name] ? "border-red-500 focus:ring-red-500" : "border-slate-300"} rounded-lg shadow-sm px-3 py-2.5 bg-white`;

  const renderError = (name) =>
    fieldErrors[name] ? <p className="mt-1 text-xs text-red-600">{fieldErrors[name]}</p> : null;

  // Separate plain function used to refresh after add/delete
  const refreshReferees = async () => {
    try {
      setFetching(true);
      setMinimumReferees(undefined);
      const user = JSON.parse(localStorage.getItem("user"));
      const [response, context] = await Promise.all([
        apiFetch(`/api/job/referees?applicationNo=${encodeURIComponent(applicationNo)}`, {
          headers: { "Authorization": `Bearer ${user.accessToken}` }
        }),
        applicationContext(applicationNo)
      ]);
      const result = await readJson(response);
      if (result.success) {
        setMinimumReferees(context.MinimumReferees);
        const filtered = result.data || [];
        setRefereesList(filtered);
      } else {
        toast.error(result.message || "Failed to fetch referees");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error fetching referees");
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
        setMinimumReferees(undefined);
        const user = JSON.parse(localStorage.getItem("user"));
        const [response, context] = await Promise.all([
          apiFetch(`/api/job/referees?applicationNo=${encodeURIComponent(applicationNo)}`, {
            headers: { "Authorization": `Bearer ${user.accessToken}` }
          }),
          applicationContext(applicationNo)
        ]);
        const result = await readJson(response);
        if (cancelled) return;
        if (result.success) {
          setMinimumReferees(context.MinimumReferees);
          const filtered = result.data || [];
          setRefereesList(filtered);
        } else {
          toast.error(result.message || "Failed to fetch referees");
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        toast.error(error.message || "Error fetching referees");
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

  const refereeStatus = getRefereeSubmissionStatus(minimumReferees, refereesList.length);

  const handleAddReferee = async (e) => {
    e.preventDefault();

    // Required Fields Validation
    const requiredFields = [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "phoneNo", label: "Phone Number" },
      { key: "email", label: "Email Address" },
      { key: "relationship", label: "Relationship" },
      { key: "institution", label: "Institution" }
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

    const fullName = `${formData.firstName.trim()}  ${formData.lastName.trim()}`.toLowerCase();
    if (refereesList.some((item) => (item.names || "").toLowerCase() === fullName)) {
      toast.error("This referee is already on your application.");
      return;
    }
    if (!window.confirm(`Add ${formData.firstName} ${formData.lastName} as a referee? Referees cannot be removed later.`)) return;

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        applicationNo,
        firstName: formData.firstName,
        middleName: "",
        lastName: formData.lastName,
        phoneNo: String(formData.phoneNo).trim(),
        email: formData.email,
        relationship: formData.relationship,
        institution: formData.institution
      };

      const response = await apiFetch("/api/job/add-referee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Referee added successfully");
        setFormData({
            firstName: "",
            lastName: "",
            phoneNo: "",
            email: "",
            relationship: "",
            institution: ""
        });
        setFieldErrors({});
        refreshReferees();
      } else {
        toast.error(result.message || result.Message || "Failed to add referee");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error adding referee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <form onSubmit={handleAddReferee} className="space-y-4" noValidate>
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <IconPlus size={20} className="text-brand-green-600" /> Add Referee
        </h3>
        {!fetching && <p className="text-sm text-slate-600">
          {refereeStatus.blocked ? refereeStatus.message : `Minimum requirement met: ${refereesList.length} referees added (minimum ${minimumReferees}).`}
        </p>}
        <p className="text-sm text-brand-grey-600">{PERMANENT_RECORD_NOTE}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">First Name <span className="text-red-600">*</span></label>
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
            <label className="block text-sm font-medium text-slate-700">Last Name <span className="text-red-600">*</span></label>
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
            <label className="block text-sm font-medium text-slate-700">Phone Number <span className="text-red-600">*</span></label>
            <input 
              type="tel" 
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
            <label className="block text-sm font-medium text-slate-700">Email Address <span className="text-red-600">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="e.g. referee@example.com"
              className={inputClass("email")} 
              required 
            />
            {renderError("email")}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Relationship <span className="text-red-600">*</span></label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              placeholder="e.g. Supervisor, Mentor, Colleague"
              className={inputClass("relationship")}
              required
            />
            {renderError("relationship")}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-slate-700">Institution / Organization <span className="text-red-600">*</span></label>
            <input 
              type="text" 
              name="institution" 
              value={formData.institution} 
              onChange={handleChange} 
              placeholder="Enter organization name"
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
            className="btn-primary px-6 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 "
          >
            {loading ? <IconLoader2 size={18} className="animate-spin" /> : <IconPlus size={18} />}
            {loading ? "Adding..." : "Add Referee"}
          </button>
        </div>
      </form>

      {/* List Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-semibold text-slate-900">Referees List</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization / Institution</th>
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
              ) : refereesList.length === 0 ? (
                <tr>
                   <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">
                      No referees added yet.
                   </td>
                </tr>
              ) : (
                refereesList.map((item) => (
                  <tr key={item.names} className="hover:bg-brand-green-50/40 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.names}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div>{item.phoneNo}</div>
                        <div className="text-xs text-slate-400">{item.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {item.institution}
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
          disabled={fetching || loading || refereeStatus.blocked}
          className="flex items-center gap-2 btn-primary px-8 py-2 rounded-lg hover:opacity-90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Referees;
