import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconLoader2, IconCheck } from "@tabler/icons-react";
import Stepper from "../../components/Stepper";
import { GenderOptions, MaritalStatusOptions, optionValue } from "../../constants/enums";
import { toast } from "react-toastify";
import PersonalDetails from "./profile/steps/PersonalDetails";
import { validatePersonalDetails as getPersonalDetailsErrors, salutationValue, salutationText } from "../../lib/applicationValidation";
import { recruitmentRequest } from "../../lib/recruitmentApi";
import AcademicQualifications from "./profile/steps/AcademicQualifications";
import WorkExperience from "./profile/steps/WorkExperience";
import ProfessionalTraining from "./profile/steps/ProfessionalTraining";
import RecruitmentRequirements from "./profile/steps/RecruitmentRequirements";
import ApplicationReview from "./profile/steps/ApplicationReview";
import Referees from "./profile/steps/Referees";
import Attachments from "./profile/steps/Attachments";
import { apiFetch, readJson } from "../../lib/http";

const ApplicationDetails = () => {
  const { applicationNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Initialize from Local Storage if available
  const [activeStep, setActiveStep] = useState(() => {
    const saved = localStorage.getItem(`app_step_${applicationNo}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [application, setApplication] = useState({ jobTitle: "", candidateStatus: "", status: "" });

  const [profile, setProfile] = useState({
    emailAddress: "",
    firstName: "",
    middleName: "",
    lastName: "",
    idNumber: "",
    initials: "",
    phoneNumber: "",
    gender: "",
    maritalStatus: "",
    postalCode: "",
    postalAddress: "",
    birthDate: "",
    disability: "false",
    disabilityStatus: "",
    pwdNumber: "",
    country: "",
    altPhoneNumber: "",
    county: "",
    citizenship: "",
    kraPin: "",
  });

  const STEPS = [
    "Personal Details",
    "Academic Qualifications",
    "Work Experience",
    "Professional Training",
    "Requirements & Memberships",
    "Referees",
    "Attachments",
    "Review and Submit"
  ];

  const getInitialsValue = (initials) => {
      return salutationValue(initials);
  };

  const formatNavDate = (dateStr) => {
      if (!dateStr) return "";
      if (dateStr.includes('T')) return dateStr.split('T')[0];
      const parts = dateStr.split('/');
      if (parts.length === 3) {
          const m = parts[0], d = parts[1];
          let y = parts[2];
          // Two-digit years: more than 5 years ahead means last century (e.g. birth year 90 -> 1990).
          if (y.length === 2) y = (2000 + Number(y) > new Date().getFullYear() + 5 ? "19" : "20") + y;
          return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      }
      return dateStr;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.accessToken) {
             navigate("/");
             return;
        }

        const response = await apiFetch(`/api/job/application-details?applicationNo=${encodeURIComponent(applicationNo)}`, {
             headers: {
                "Authorization": `Bearer ${user.accessToken}`
             }
        });
        const result = await readJson(response);

        if (result.success) {
          const data = result.data || {};
          setApplication({ jobTitle: data.JobTitle || "", candidateStatus: data.CandidateStatus || "", status: data.Status || "" });
          // Map application details to the profile/form structure
          // Note: Assuming Application Details contains the Personal info snapshot
          setProfile({
            emailAddress: data.Email || "",
            firstName: data.FirstName || "",
            middleName: data.MiddleName || "",
            lastName: data.LastName || "",
            idNumber: data.IDPassportNo || "",
            initials: getInitialsValue(data.Salutation), 
            phoneNumber: data.PhoneNo || "",
            gender: optionValue(GenderOptions, data.Gender),
            maritalStatus: optionValue(MaritalStatusOptions, data.MaritalStatus),
            postalCode: data.PostalCode || "",
            postalAddress: data.Address || "",
            birthDate: formatNavDate(data.DateOfBirth),
            // GetJobApplicationDetails does not return the disability fields, so they start blank.
            disability: "false",
            disabilityStatus: "",
            pwdNumber: "",
            country: data.Country || "",
            altPhoneNumber: data.AltPhoneNo || "",
            county: data.County || "",
            citizenship: data.Citizenship || "",
            kraPin: data.KRApin || "",
          });

          setIsSubmitted(data.Submitted === true);
        } else {
          toast.error(result.message || "Failed to load application details");
        }
      } catch (error) {
        toast.error(error.message || "Error loading application details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationNo) {
      fetchDetails();
    }
  }, [applicationNo, navigate]);

  // Persist Step to Local Storage
  useEffect(() => {
    if (applicationNo) {
      localStorage.setItem(`app_step_${applicationNo}`, activeStep);
    }
  }, [activeStep, applicationNo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const validatePersonalDetails = () => {
    const errors = getPersonalDetailsErrors(profile);
    if (Object.keys(errors).length) {
      toast.error(Object.values(errors).join(" "));
      return false;
    }

    return true;
  };

  const [saving, setSaving] = useState(false);

  const handleUpdatePersonalDetails = async () => {
    // If submitted, skip saving and just go next
    if (isSubmitted) {
      handleNext();
      return;
    }

    if (!validatePersonalDetails()) {
      return;
    }

    try {
      setSaving(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      const payload = {
        applicationNo,
        salutation: getInitialsText(profile.initials),
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        idPassportNo: profile.idNumber,
        phoneNo: String(profile.phoneNumber || ""),
        altPhoneNo: String(profile.altPhoneNumber || ""),
        dateOfBirth: profile.birthDate,
        gender: Number(profile.gender) || 0,
        maritalStatus: Number(profile.maritalStatus) || 0,
        country: profile.country,
        countyCode: profile.county,
        postalAddress: profile.postalAddress,
        postalCode: profile.postalCode,
        disability: profile.disability === "true",
        disabilityType: profile.disabilityStatus,
        pwdNumber: profile.pwdNumber,
        kraPin: profile.kraPin,
        citizenship: profile.citizenship
      };

      const response = await apiFetch("/api/job/update-personal-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await readJson(response);
      if (result.success) {
        toast.success("Personal details saved");
        handleNext();
      } else {
        toast.error(result.message || result.Message || "Failed to save personal details");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while saving personal details. Please try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getInitialsText = (value) => {
    return salutationText(value);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    // The page scrolls inside <main>, not the window.
    document.querySelector("main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    // The page scrolls inside <main>, not the window.
    document.querySelector("main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
      if(e) e.preventDefault();

      try {
        setSaving(true);
        await recruitmentRequest(`submit-application?applicationNo=${encodeURIComponent(applicationNo)}`, { method: "POST" });
        toast.success("Application successfully submitted!");
        setIsSubmitted(true);
        setApplication((prev) => ({ ...prev, candidateStatus: "Submitted" }));
        localStorage.removeItem(`app_step_${applicationNo}`);
        setTimeout(() => navigate("/app/applications"), 3000);
      } catch (error) {
        toast.error(error.message || "Submission failed. Please ensure all steps are complete.");
      } finally {
        setSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <IconLoader2 className="animate-spin text-brand-green-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/app/applications")}
        className="flex items-center gap-2 text-brand-green-600 hover:text-brand-green-600 font-medium transition-colors"
      >
        <IconArrowLeft size={20} /> Back to My Applications
      </button>

      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-sm text-slate-500">Application {applicationNo}</p>
            <h2 className="text-xl font-semibold text-slate-800">{application.jobTitle || "Job application"}</h2>
          </div>
          <span className="rounded-full bg-brand-green-50 text-brand-green-800 px-3 py-1 text-sm font-medium">{application.candidateStatus || "Draft"}</span>
        </div>

        {/* Stepper Header */}
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 ${isSubmitted ? 'hidden' : ''}`}>
           <Stepper 
             steps={STEPS} 
             activeStep={activeStep} 
             onStepClick={!isSubmitted ? (index) => {
               if (index <= activeStep) setActiveStep(index);
             } : undefined} 
             stepBgColor="bg-white"
           />
        </div>

        {isSubmitted && <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6"><ApplicationReview applicationNo={applicationNo} profile={profile} submitted status={application.candidateStatus} /></div>}

        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8 ${isSubmitted ? 'hidden' : ''}`}>
            {activeStep === 0 && (
                <PersonalDetails 
                    profile={profile} 
                    handleChange={handleChange} 
                    onNext={handleUpdatePersonalDetails} 
                    saving={saving}
                />
            )}
            {activeStep === 1 && (
                <AcademicQualifications 
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext} 
                />
            )}
            {activeStep === 2 && (
                <WorkExperience 
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext} 
                />
            )}
            {activeStep === 3 && (
                <ProfessionalTraining 
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext} 
                />
            )}
            {activeStep === 4 && (
                <RecruitmentRequirements
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext} 
                />
            )}
            {activeStep === 5 && (
                <Referees 
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext} 
                />
            )}
            {activeStep === 6 && (
                <Attachments 
                    applicationNo={applicationNo}
                    onBack={handleBack} 
                    onNext={handleNext}
                    loading={saving}
                />
            )}
            {activeStep === 7 && <ApplicationReview applicationNo={applicationNo} profile={profile} onBack={handleBack} onSubmit={handleSubmit} loading={saving} />}

        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
