import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import { toast } from "react-toastify";
import Stepper from "../../components/Stepper";
import RecordStep from "../../components/application/RecordStep";
import FormStep from "../../components/application/FormStep";
import { GenderOptions, MaritalStatusOptions, optionValue } from "../../constants/enums";
import { validatePersonalDetails, salutationValue } from "../../lib/applicationValidation";
import { applicationContext, load, post, recruitmentRequest } from "../../lib/recruitmentApi";
import PersonalDetails from "./profile/steps/PersonalDetails";
import Attachments from "./profile/steps/Attachments";
import ApplicationReview from "./profile/steps/ApplicationReview";
import {
  employmentStatus, otherDetails, academicQualifications, professionalTraining, workExperience,
  dutiesAndAbilities, referees,
} from "./profile/steps/kcicSections";

// The KCIC "Application for Employment" form, in its own section order.
const STEPS = [
  "Personal Details",        // 1–2
  "Current Employment",      // 3–4
  "Other Details",           // 5
  "Qualifications",          // 6
  "Courses & Memberships",   // 7
  "Employment History",      // 8
  "Duties & Abilities",      // 9–10
  "References",              // 11
  "Attachments",
  "Review & Declaration",
];

/** Maps GetJobApplicationDetails (codeunit 70007) to the Personal Details form. */
const profileFromDetails = (data) => ({
  emailAddress: data.Email || "",
  firstName: data.FirstName || "",
  middleName: data.MiddleName || "",
  lastName: data.LastName || "",
  idNumber: data.IDPassportNo || "",
  initials: salutationValue(data.Salutation),
  phoneNumber: data.PhoneNo || "",
  altPhoneNumber: data.AltPhoneNo || "",
  gender: optionValue(GenderOptions, data.Gender),
  maritalStatus: optionValue(MaritalStatusOptions, data.MaritalStatus),
  postalCode: data.PostalCode || "",
  postalAddress: data.Address || "",
  birthDate: data.DateOfBirth || "",
  nationality: data.Nationality || "",
  citizenship: data.Citizenship || "",
  country: data.Country || "",
  county: data.County || "",
  kraPin: data.KRAPin || "",
  altContactPerson: data.AlternativeContactPerson || "",
  altContactPhone: data.AltContactPhone || "",
});

const ApplicationDetails = () => {
  const { applicationNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(() => {
    const saved = Number.parseInt(localStorage.getItem(`app_step_${applicationNo}`) || "0", 10);
    return Number.isInteger(saved) && saved >= 0 && saved < STEPS.length ? saved : 0;
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [application, setApplication] = useState({ jobTitle: "", requisitionNo: "", candidateStatus: "" });
  const [context, setContext] = useState(null);
  const [profile, setProfile] = useState(() => profileFromDetails({}));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.accessToken) {
      navigate("/");
      return;
    }
    let active = true;
    Promise.all([load("application-details", applicationNo), applicationContext(applicationNo)])
      .then(([data, ctx]) => {
        if (!active) return;
        setApplication({ jobTitle: data.JobTitle || "", requisitionNo: data.RequisitionNo || "", candidateStatus: data.CandidateStatus || "" });
        setProfile(profileFromDetails(data));
        setIsSubmitted(data.Submitted === true);
        setContext(ctx);
      })
      .catch((error) => active && toast.error(error.message || "Error loading application details"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [applicationNo, navigate]);

  useEffect(() => {
    localStorage.setItem(`app_step_${applicationNo}`, activeStep);
  }, [activeStep, applicationNo]);

  const goTo = (step) => {
    setActiveStep(Math.min(Math.max(step, 0), STEPS.length - 1));
    // The page scrolls inside <main>, not the window.
    document.querySelector("main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  };
  const handleNext = () => goTo(activeStep + 1);
  const handleBack = () => goTo(activeStep - 1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const savePersonalDetails = async () => {
    const errors = validatePersonalDetails(profile);
    if (Object.keys(errors).length) {
      toast.error(Object.values(errors).join(" "));
      return;
    }
    setSaving(true);
    try {
      await post("update-personal-details", {
        applicationNo,
        salutation: profile.initials,
        firstName: profile.firstName,
        middleName: profile.middleName,
        lastName: profile.lastName,
        idPassportNo: profile.idNumber,
        phoneNo: String(profile.phoneNumber || ""),
        altPhoneNo: String(profile.altPhoneNumber || ""),
        dateOfBirth: profile.birthDate,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        nationality: profile.nationality,
        citizenship: profile.citizenship,
        country: profile.country,
        countyCode: profile.county,
        postalAddress: profile.postalAddress,
        postalCode: profile.postalCode,
        kraPin: profile.kraPin,
        altContactPerson: profile.altContactPerson,
        altContactPhone: profile.altContactPhone,
      });
      toast.success("Personal details saved");
      handleNext();
    } catch (error) {
      toast.error(error.message || "An error occurred while saving personal details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
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

  const record = (config, minimum = 0) =>
    <RecordStep key={config.listPath} applicationNo={applicationNo} config={{ ...config, minimum }} onBack={handleBack} onNext={handleNext} />;
  const form = (config) =>
    <FormStep applicationNo={applicationNo} config={config} onBack={handleBack} onNext={handleNext} />;

  const stepContent = [
    () => <PersonalDetails profile={profile} handleChange={handleChange} onNext={savePersonalDetails} saving={saving} />,
    () => form(employmentStatus),
    () => form(otherDetails),
    () => record(academicQualifications, context?.MinimumAcademicQualifications ?? 1),
    () => record(professionalTraining),
    () => record(workExperience),
    () => form(dutiesAndAbilities),
    () => record(referees, context?.MinimumReferees ?? 3),
    () => <Attachments applicationNo={applicationNo} onBack={handleBack} onNext={handleNext} />,
    () => <ApplicationReview applicationNo={applicationNo} profile={profile} onBack={handleBack} onSubmit={handleSubmit} loading={saving} />,
  ];

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/app/applications")}
        className="flex items-center gap-2 text-brand-green-600 hover:text-brand-green-700 font-medium transition-colors"
      >
        <IconArrowLeft size={20} /> Back to My Applications
      </button>

      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 flex flex-wrap justify-between items-center gap-3">
          <div>
            <p className="text-sm text-slate-500">Application {applicationNo}{application.requisitionNo && ` · Vacancy Ref No ${application.requisitionNo}`}</p>
            <h2 className="text-xl font-semibold text-slate-800">{application.jobTitle || "Job application"}</h2>
          </div>
          <span className="rounded-full bg-brand-green-50 text-brand-green-800 px-3 py-1 text-sm font-medium">{application.candidateStatus || "Draft"}</span>
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <ApplicationReview applicationNo={applicationNo} profile={profile} submitted status={application.candidateStatus} />
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6 overflow-x-auto">
              <Stepper steps={STEPS} activeStep={activeStep} onStepClick={(index) => index <= activeStep && goTo(index)} stepBgColor="bg-white" />
              <p className="mt-4 text-center text-sm text-slate-600 sm:hidden">Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-8">
              {stepContent[activeStep]()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetails;
