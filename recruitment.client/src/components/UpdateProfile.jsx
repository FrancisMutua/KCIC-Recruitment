import { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaGlobe,
  FaVenusMars,
  FaHeart,
  FaUniversalAccess,
  FaFingerprint,
  FaSave,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAccount } from "../context/AccountContext";
import SearchableSelect from "./SearchableSelect";
import { useNavigate } from "react-router-dom";
import { useAccountDetails } from "../hooks/useAccountDetails";
import { changeDocumentTitle } from "../scripts/script";

const UpdateProfile = () => {
  const navigate = useNavigate();

  const {
    isCountryLoading,
    countries,
    isTribeLoading,
    ethnicity,
    isCountyLoading,
    counties,
    isLoading,
    updateUserProfile,
  } = useAccount();

  const { account, isLoading: isAccountLoading } = useAccountDetails();

  const [formData, setFormData] = useState({
    initials: "",
    firstName: "",
    middleName: "",
    lastName: "",
    emailAddress: "",
    idNumber: "",
    telNo: "",
    altTelNo: "",
    postCode: "",
    postalAddress: "",
    country: "",
    county: "",
    subCounty: "",
    gender: "",
    maritalStatus: "",
    dateOfBirth: "",
    age: 0,
    ethnicity: "",
    kraPin: "",
    isPwd: false,
    pwdNo: "",
    disabilityType: "",
  });

  useEffect(() => {
    if (!isAccountLoading && account) {
      setFormData((prev) => ({
        ...prev,
        firstName: account.firstName || "",
        middleName: account.middleName || "",
        lastName: account.lastName || "",
        emailAddress: account.emailAddress || "",
        idNumber: account.idNumber || "",
        telNo: account.telephoneNo || "",
      }));
    }
  }, [isAccountLoading, account]);

  useEffect(() => {
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age: age }));
    }
  }, [formData.dateOfBirth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("accessToken");
      const newUser = { ...formData, token };
      await updateUserProfile(newUser, token);
      toast.success("Profile updated successfully!");
      navigate("/app/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    changeDocumentTitle("Profile Update");
    return () => changeDocumentTitle("KUCCPS Recruitment Portal");
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-[#00171f] tracking-tight uppercase">
          Complete Your <span className="text-red-600">Profile</span>
        </h1>
        <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">
          Provide accurate information to enhance your recruitment eligibility
          within the service.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PERSONAL IDENTITY */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-6 md:p-10">
          <SectionHeader icon={<FaUser />} title="Personal Identity" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <SelectField
              label="Initials"
              name="initials"
              value={formData.initials}
              onChange={handleChange}
              options={[
                { code: "", description: "--Select--" },
                { code: 1, description: "Mr." },
                { code: 2, description: "Mrs." },
                { code: 3, description: "Miss." },
              ]}
              required
            />
            <InputField
              label="First Name"
              name="firstName"
              icon={<FaUser />}
              value={formData.firstName}
              readOnly
            />
            <InputField
              label="Middle Name"
              name="middleName"
              icon={<FaUser />}
              value={formData.middleName}
              readOnly
            />
            <InputField
              label="Last Name"
              name="lastName"
              icon={<FaUser />}
              value={formData.lastName}
              readOnly
            />

            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { code: "", description: "--Select--" },
                { code: 1, description: "Female" },
                { code: 2, description: "Male" },
              ]}
              icon={<FaVenusMars />}
              required
            />
            <SelectField
              label="Marital Status"
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
              options={[
                { code: "", description: "--Select--" },
                { code: 0, description: "Single" },
                { code: 1, description: "Married" },
                { code: 2, description: "Divorced" },
                { code: 3, description: "Widow" },
                { code: 4, description: "Widower" },
              ]}
              icon={<FaHeart />}
              required
            />
            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              icon={<FaCalendarAlt />}
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
            <InputField
              label="Calculated Age"
              name="age"
              value={formData.age}
              readOnly
            />
          </div>
        </section>

        {/* SECTION 2: CONTACT & ADDRESS */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-6 md:p-10">
          <SectionHeader
            icon={<FaMapMarkerAlt />}
            title="Contact & Address Details"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <InputField
              label="Email Address"
              name="emailAddress"
              type="email"
              icon={<FaEnvelope />}
              value={formData.emailAddress}
              readOnly
            />
            <InputField
              label="Telephone No"
              name="telNo"
              icon={<FaPhone />}
              value={formData.telNo}
              readOnly
            />
            <InputField
              label="Alt. Telephone No"
              name="altTelNo"
              type="number"
              icon={<FaPhone />}
              value={formData.altTelNo}
              onChange={handleChange}
            />
            <InputField
              label="Post Code"
              name="postCode"
              icon={<FaMapMarkerAlt />}
              value={formData.postCode}
              onChange={handleChange}
            />
            <InputField
              label="Postal Address"
              name="postalAddress"
              icon={<FaMapMarkerAlt />}
              value={formData.postalAddress}
              onChange={handleChange}
            />

            <SearchableSelect
              label="Country"
              name="country"
              icon={<FaGlobe />}
              options={!isCountryLoading ? countries : []}
              value={formData.country}
              onChange={handleChange}
              placeholder={
                isCountryLoading ? "Loading..." : "--Select Country--"
              }
              required
            />

            <SearchableSelect
              label="County"
              name="county"
              icon={<FaMapMarkerAlt />}
              options={!isCountyLoading ? counties : []}
              value={formData.county}
              onChange={handleChange}
              placeholder={isCountyLoading ? "Loading..." : "--Select County--"}
              required
            />

            <InputField
              label="Sub County"
              name="subCounty"
              icon={<FaMapMarkerAlt />}
              value={formData.subCounty}
              onChange={handleChange}
            />

            <SearchableSelect
              label="Ethnicity"
              name="ethnicity"
              icon={<FaGlobe />}
              options={!isTribeLoading ? ethnicity : []}
              value={formData.ethnicity}
              onChange={handleChange}
              placeholder={isTribeLoading ? "Loading..." : "--Select Tribe--"}
              required
            />
          </div>
        </section>

        {/* SECTION 3: STATUTORY & DISABILITY */}
        <section className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 p-6 md:p-10">
          <SectionHeader
            icon={<FaIdCard />}
            title="Statutory & Disability Info"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <InputField
              label="ID / Passport Number"
              name="idNumber"
              icon={<FaIdCard />}
              value={formData.idNumber}
              readOnly
            />
            <InputField
              label="KRA Pin"
              name="kraPin"
              icon={<FaFingerprint />}
              value={formData.kraPin}
              onChange={handleChange}
              required
            />

            <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 self-end h-[46px]">
              <label className="text-[12px] font-black uppercase tracking-widest text-gray-500 leading-none">
                Person with Disability?
              </label>
              <input
                type="checkbox"
                name="isPwd"
                checked={formData.isPwd}
                onChange={handleChange}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>

            {formData.isPwd && (
              <>
                <InputField
                  label="P.W.D Number"
                  name="pwdNo"
                  icon={<FaUniversalAccess />}
                  value={formData.pwdNo}
                  onChange={handleChange}
                />
                <InputField
                  label="Disability Type"
                  name="disabilityType"
                  icon={<FaUniversalAccess />}
                  value={formData.disabilityType}
                  onChange={handleChange}
                />
              </>
            )}
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-end gap-4 pb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3.5 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-200 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {isLoading ? (
              "Processing..."
            ) : (
              <>
                <FaSave className="inline mr-2" size={14} /> Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* --- Helper Sub-Components --- */

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-3">
    <span className="text-red-600 text-sm">{icon}</span>
    <h2 className="text-xs md:text-sm font-black text-[#00171f] uppercase tracking-[0.2em]">
      {title}
    </h2>
  </div>
);

const InputField = ({ label, icon, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute text-base left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors">
          {icon}
        </div>
      )}
      <input
        className={`w-full ${icon ? "pl-10" : "px-4"} pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm read-only:bg-gray-100/50 read-only:cursor-not-allowed`}
        placeholder={`${label}`}
        {...props}
      />
    </div>
  </div>
);

const SelectField = ({ label, icon, options, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute text-base left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors z-10">
          {icon}
        </div>
      )}
      <select
        className={`w-full ${icon ? "pl-10" : "px-4"} pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all font-medium text-gray-700 text-sm appearance-none cursor-pointer`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.description}
          </option>
        ))}
      </select>
    </div>
  </div>
);

export default UpdateProfile;
