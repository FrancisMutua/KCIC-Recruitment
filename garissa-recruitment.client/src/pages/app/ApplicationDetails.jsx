import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft } from "@tabler/icons-react";
import { Spinner, StatusBadge } from "../../components/ui/kit";
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
import { toIsoDate } from "../../lib/bcDate";
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
  const [furthestStep, setFurthestStep] = useState(() => {
    const saved = Number(localStorage.getItem(`app_furthest_${applicationNo}`));
    return Number.isFinite(saved) ? saved : 0;
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

  const STEP_HELP = [
    "Check the details copied from your profile and fill in anything missing.",
    "Add every academic qualification relevant to this position, highest first.",
    "List your employment history. Each employer can be added once.",
    "Add professional qualifications or certifications (optional unless the advert requires them).",
    "Review the advert's minimum requirements and add any professional memberships.",
    "Add people who can vouch for your work. They may be contacted.",
    "Upload each required document as a PDF (up to 5 MB).",
    "Check everything below, then submit your application to Garissa University.",
  ];

  const getInitialsValue = (initials) => {
      return salutationValue(initials);
  };

  const formatNavDate = (dateStr) => toIsoDate(dateStr);

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
      setFurthestStep((prev) => {
        const next = Math.max(prev, activeStep);
        localStorage.setItem(`app_furthest_${applicationNo}`, next);
        return next;
      });
    }
  }, [activeStep, applicationNo]);

  // The page scrolls inside <main id="app-main">, not the window.
  const scrollToTop = () => document.getElementById("app-main")?.scrollTo({ top: 0, behavior: "smooth" });

  const goToStep = (index) => {
    if (index <= furthestStep || index <= activeStep) { setActiveStep(index); scrollToTop(); }
  };

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
    scrollToTop();
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    scrollToTop();
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
        localStorage.removeItem(`app_furthest_${applicationNo}`);
        setTimeout(() => navigate("/app/applications"), 3000);
      } catch (error) {
        toast.error(error.message || "Submission failed. Please ensure all steps are complete.");
      } finally {
        setSaving(false);
      }
  };

  if (loading) return <Spinner label="Loading your application…" />;

  const stepProps = { applicationNo, onBack: handleBack, onNext: handleNext };

  return (
    <div className="space-y-6">
      <Link to="/app/applications" className="btn btn-ghost -ml-3"><IconArrowLeft size={18} /> My applications</Link>

      <header className="card overflow-hidden">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-green-600">Application {applicationNo}</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl">{application.jobTitle || "Job application"}</h1>
            {!isSubmitted && <p className="mt-1 text-sm text-slate-500">Your progress is saved as you go. Submit when every step is complete.</p>}
          </div>
          <StatusBadge status={application.candidateStatus} />
        </div>
        {!isSubmitted && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
            <Stepper steps={STEPS} activeStep={activeStep} furthestStep={furthestStep} onStepClick={(index) => goToStep(index)} />
          </div>
        )}
      </header>

      {isSubmitted ? (
        <div className="card card-body">
          <ApplicationReview applicationNo={applicationNo} profile={profile} submitted status={application.candidateStatus} />
        </div>
      ) : (
        <section className="card card-body" aria-labelledby="step-heading">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step {activeStep + 1} of {STEPS.length}</p>
            <h2 id="step-heading" className="mt-1 text-lg font-semibold sm:text-xl">{STEPS[activeStep]}</h2>
            {STEP_HELP[activeStep] && <p className="mt-1 text-sm text-slate-500">{STEP_HELP[activeStep]}</p>}
          </div>
          {activeStep === 0 && <PersonalDetails profile={profile} handleChange={handleChange} onNext={handleUpdatePersonalDetails} saving={saving} />}
          {activeStep === 1 && <AcademicQualifications {...stepProps} />}
          {activeStep === 2 && <WorkExperience {...stepProps} />}
          {activeStep === 3 && <ProfessionalTraining {...stepProps} />}
          {activeStep === 4 && <RecruitmentRequirements {...stepProps} />}
          {activeStep === 5 && <Referees {...stepProps} />}
          {activeStep === 6 && <Attachments {...stepProps} loading={saving} />}
          {activeStep === 7 && <ApplicationReview applicationNo={applicationNo} profile={profile} onBack={handleBack} onSubmit={handleSubmit} loading={saving} />}
        </section>
      )}
    </div>
  );
};

export default ApplicationDetails;
