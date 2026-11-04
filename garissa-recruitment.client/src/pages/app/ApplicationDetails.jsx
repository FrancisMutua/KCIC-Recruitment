import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IconArrowLeft, IconLoader2, IconCheck } from "@tabler/icons-react";
import Stepper from "../../components/Stepper";
import { GenderEnum, MaritalStatusEnum } from "../../constants/enums";
import { toast } from "react-toastify";
import PersonalDetails from "./profile/steps/PersonalDetails";
import { validatePersonalDetails as getPersonalDetailsErrors, salutationValue, salutationText } from "../../lib/applicationValidation";
import AcademicQualifications from "./profile/steps/AcademicQualifications";
import WorkExperience from "./profile/steps/WorkExperience";
import ProfessionalTraining from "./profile/steps/ProfessionalTraining";
// Relative / Next of Kin is intentionally excluded from the application flow.
// import NextOfKin from "./profile/steps/NextOfKin";
import RecruitmentRequirements from "./profile/steps/RecruitmentRequirements";
import ApplicationReview from "./profile/steps/ApplicationReview";
import Referees from "./profile/steps/Referees";
import Attachments from "./profile/steps/Attachments";

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
    subCounty: "",
    wardCode: "",
    citizenship: "",
    kraPin: "",
    ethnicity: "",
    currentSalary: "",
    expectedSalary: "",
    noticePeriod: "",
    // Add placeholders if needed for other sections
  });

  const STEPS = [
    "Personal Details",
    "Academic Qualifications",
    "Work Experience",
    "Professional Training",
    "Job Requirements",
    "Referees",
    "Attachments",
    "Review and Submit"
  ];

  // Helper mappings (reused from ProfileUpdate logic)
  const getMaritalStatusValue = (status) => {
    if (status === undefined || status === null) return "";
    const statusStr = status.toString();
    
    // If it's already a valid enum value (0-5), return it
    if (Object.values(MaritalStatusEnum).some(val => val.toString() === statusStr)) {
        return statusStr;
    }

    const map = { 
      "Single": MaritalStatusEnum.Single, 
      "Married": MaritalStatusEnum.Married, 
      "Divorced": MaritalStatusEnum.Divorced, 
      "Widow": MaritalStatusEnum.Widow, 
      "Widower": MaritalStatusEnum.Widower,
      "Widowed": MaritalStatusEnum.Widow, 
      "Complicated": MaritalStatusEnum.Complicated 
    };
    return map[statusStr] !== undefined ? map[statusStr].toString() : "";
  };
  
  const getGenderValue = (gender) => {
      if (gender === undefined || gender === null) return "";
      const genderStr = gender.toString();
      
      // If it's already a valid enum value (1-5), return it
      if (Object.values(GenderEnum).some(val => val.toString() === genderStr)) {
          return genderStr;
      }

      const lowerGender = genderStr.toLowerCase();
      if(lowerGender === "female") return GenderEnum.Female.toString();
      if(lowerGender === "male") return GenderEnum.Male.toString();
      if(lowerGender === "nonbinary" || lowerGender === "non-binary") return GenderEnum.NonBinary.toString();
      return "";
  }

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
          if (y.length === 2) y = "20" + y; 
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

        const response = await fetch(`/api/job/application-details?applicationNo=${applicationNo}`, {
             headers: {
                "Authorization": `Bearer ${user.accessToken}`
             }
        });
        const result = await response.json();

        if (result.success) {
          const data = result.data || {};
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
            gender: getGenderValue(data.Gender),
            maritalStatus: getMaritalStatusValue(data.MaritalStatus), 
            postalCode: data.PostalCode || "",
            postalAddress: data.Address || "",
            birthDate: formatNavDate(data.DateOfBirth),
            disability: data.PWD ? "true" : "false",
            disabilityStatus: data.DisabilityType || "",
            pwdNumber: data.PWDNumber || "",
            country: data.Country || "",
            altPhoneNumber: data.AltPhoneNo || "",
            county: data.County || "",
            subCounty: data.SubCounty || "",
            wardCode: data.Ward || data.WardCode || "",
            citizenship: data.Citizenship || "",
            kraPin: data.KRApin || "",
            ethnicity: data.Ethnicity || "",
            currentSalary: data.CurrentSalary ?? "",
            expectedSalary: data.ExpectedSalary ?? "",
            noticePeriod: data.NoticePeriod || "",
          });
          
          if (data.Status === "Submitted" || data.Status === "Closed" || data.CandidateStatus === "Withdrawn") {
            setIsSubmitted(true);
          }
        } else {
          toast.error(result.message || "Failed to load application details");
        }
      } catch (error) {
        toast.error("Error loading application details");
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
        email: profile.emailAddress,
        phoneNo: String(profile.phoneNumber || ""),
        altPhoneNo: String(profile.altPhoneNumber || ""),
        dateOfBirth: profile.birthDate,
        gender: parseInt(profile.gender) || 0,
        maritalStatus: profile.maritalStatus === "" || profile.maritalStatus == null
          ? MaritalStatusEnum.Single
          : Number(profile.maritalStatus),
        country: profile.country,
        countyCode: profile.county,
        subCountyCode: profile.subCounty,
        wardCode: profile.wardCode,
        postalAddress: profile.postalAddress,
        postalCode: profile.postalCode,
        disability: profile.disability === "true",
        disabilityType: profile.disabilityStatus,
        pwdNumber: profile.pwdNumber,
        kraPin: profile.kraPin,
        citizenship: profile.citizenship,
        ethnicity: profile.ethnicity,
        currentSalary: parseFloat(profile.currentSalary) || 0,
        expectedSalary: parseFloat(profile.expectedSalary) || 0,
        noticePeriod: profile.noticePeriod
      };

      const response = await fetch("/api/job/update-personal-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Personal details saved");
        handleNext();
      } else {
        toast.error(result.message || result.Message || "Failed to save personal details");
      }
    } catch (error) {
      toast.error("An error occurred while saving personal details. Please try again.");
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
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
      if(e) e.preventDefault();
      
      try {
        setSaving(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await fetch(`/api/job/submit-application?applicationNo=${applicationNo}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${user.accessToken}`
          }
        });

        const result = await response.json();
        if (result.success) {
          toast.success("Application successfully submitted!");
          setIsSubmitted(true);
          // Clear saved step on completion
          localStorage.removeItem(`app_step_${applicationNo}`);
          setTimeout(() => {
              navigate("/app/applications");
          }, 3000);
        } else {
          toast.error(result.message || "Submission failed");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred during submission. Please ensure all steps are complete.");
      } finally {
        setSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <IconLoader2 className="animate-spin text-brand-green" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/app/applications")}
        className="flex items-center gap-2 text-brand-green hover:text-brand-green font-medium transition-colors"
      >
        <IconArrowLeft size={20} /> Back to My Applications
      </button>

      <div className="max-w-full mx-auto">


        {/* Stepper Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
           <Stepper 
             steps={STEPS} 
             activeStep={activeStep} 
             onStepClick={!isSubmitted ? (index) => {
               if (index <= activeStep) setActiveStep(index);
             } : undefined} 
             stepBgColor="bg-white"
           />
        </div>

        {isSubmitted && <div className="bg-white rounded-xl shadow-sm p-6"><ApplicationReview applicationNo={applicationNo} profile={profile} submitted /></div>}

        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${isSubmitted ? 'hidden' : ''}`}>
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
