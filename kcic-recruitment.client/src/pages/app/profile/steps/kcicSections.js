// The KCIC "Application for Employment" form (KCIC 22.01.2024), section by section, mapped to
// codeunit 70007. Field lengths follow the AL parameters / table fields the values are stored in.
import { AcademicLevelOptions } from "../../../../constants/enums.js";
import { isBlank } from "../../../../lib/applicationValidation.js";

const enc = encodeURIComponent;
const dateOrNull = (value) => (isBlank(value) ? null : value);
const amount = (value) => (isBlank(value) ? 0 : Number(value) || 0);
const shownAmount = (value) => (Number(value) ? String(value) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const thisYear = new Date().getFullYear();

// ── Section 3 and 4: current employment / unemployed applicants ────────────
const employed = (v) => v.employed === true;
export const employmentStatus = {
  savePath: "update-employment",
  fromDetails: (d) => ({
    employed: !isBlank(d.CurrentWorkplace),
    currentWorkplace: d.CurrentWorkplace || "",
    currentPosition: d.CurrentPosition || "",
    effectiveDate: d.EffectiveDate || "",
    currentMonthlySalary: shownAmount(d.CurrentMonthlySalary),
    industrialAttachment: d.IndustrialAttachment === true,
    industrialAttachmentEmployer: d.IndustrialAttachmentEmployer || "",
    industrialAttachmentPeriod: d.IndustrialAttachmentPeriod || "",
    internshipTaken: d.InternshipTaken === true,
    internshipEmployer: d.InternshipEmployer || "",
    internshipPeriod: d.InternshipPeriod || "",
    desiredSalary: shownAmount(d.DesiredSalary),
  }),
  sections: [
    {
      title: "Employment status",
      fields: [{ name: "employed", label: "Are you currently employed?", type: "yesno" }],
    },
    {
      title: "3. Current Employment Details",
      show: employed,
      fields: [
        { name: "currentWorkplace", label: "Current employer", required: true, maxLength: 250 },
        { name: "currentPosition", label: "Position held", required: true, maxLength: 250 },
        { name: "effectiveDate", label: "Effective date", type: "date", required: true },
        { name: "currentMonthlySalary", label: "Salary (monthly) Ksh", type: "number", required: true, min: 0, step: "any" },
      ],
    },
    {
      title: "4. Unemployed Applicants",
      show: (v) => !employed(v),
      fields: [
        { name: "industrialAttachment", label: "Have you taken any industrial attachment?", type: "yesno" },
        { name: "industrialAttachmentEmployer", label: "Employer", required: true, maxLength: 100, show: (v) => v.industrialAttachment },
        { name: "industrialAttachmentPeriod", label: "Period", required: true, maxLength: 50, placeholder: "e.g. May–Aug 2023", show: (v) => v.industrialAttachment },
        { name: "internshipTaken", label: "Have you taken any internship?", type: "yesno" },
        { name: "internshipEmployer", label: "Employer", required: true, maxLength: 100, show: (v) => v.internshipTaken },
        { name: "internshipPeriod", label: "Period", required: true, maxLength: 50, show: (v) => v.internshipTaken },
        { name: "desiredSalary", label: "Desired salary (monthly) Ksh", type: "number", required: true, min: 0, step: "any" },
      ],
    },
  ],
  toPayload: (v) => {
    const job = employed(v);
    return {
      currentWorkplace: job ? v.currentWorkplace : "",
      currentPosition: job ? v.currentPosition : "",
      effectiveDate: job ? dateOrNull(v.effectiveDate) : null,
      currentMonthlySalary: job ? amount(v.currentMonthlySalary) : 0,
      industrialAttachment: !job && v.industrialAttachment,
      industrialAttachmentEmployer: v.industrialAttachmentEmployer,
      industrialAttachmentPeriod: v.industrialAttachmentPeriod,
      internshipTaken: !job && v.internshipTaken,
      internshipEmployer: v.internshipEmployer,
      internshipPeriod: v.internshipPeriod,
      desiredSalary: job ? 0 : amount(v.desiredSalary),
    };
  },
};

// ── Section 5: other details (a–i) ─────────────────────────────────────────
const yesWith = (flag, label, fields) => [
  { name: flag, label, type: "yesno", full: true },
  ...fields.map((field) => ({ required: true, ...field, show: (v) => v[flag] })),
];
const details = (name, label = "Details") => ({ name, label, type: "textarea", maxLength: 250, rows: 2 });
const accusations = [
  ["accFraudBriberyCorruption", "(i) Fraud, bribery or corruption"],
  ["accSlaveryTrafficking", "(ii) Any treatment of individuals which could amount to slavery or human trafficking"],
  ["accMoneyLaundering", "(iii) Money laundering"],
  ["accTerrorism", "(iv) Funding, or otherwise being involved in, terrorism"],
  ["accChildVulnerableRights", "(v) Child or vulnerable adults' rights violations"],
  ["accSexualHarassment", "(vi) Sexual harassment or sexual misconduct"],
];
const otherDetailKeys = [
  "LanguagesProficientIn", "InterviewedAtKCIC", "KCICPositionApplied", "KCICInterviewDate", "RelativeAtKCIC",
  "RelativeAtKCICDetails", "ConflictOfInterest", "ConflictOfInterestDetails", "DismissedFromEmployment", "DismissalReason",
  "DismissalDate", "LitigationLast3Years", "LitigationDetails", "ConvictedLast3Years", "ConvictionDetails",
  "AccFraudBriberyCorruption", "AccSlaveryTrafficking", "AccMoneyLaundering", "AccTerrorism", "AccChildVulnerableRights",
  "AccSexualHarassment",
];
const camel = (key) => key[0].toLowerCase() + key.slice(1);

export const otherDetails = {
  savePath: "update-other-details",
  fromDetails: (d) => ({
    ...Object.fromEntries(otherDetailKeys.map((key) => [camel(key), typeof d[key] === "boolean" ? d[key] : d[key] ?? ""])),
    disabled: d.PWD === true,
    disabilityType: d.DisabilityType || "",
    pwdNumber: d.PWDNumber || "",
  }),
  sections: [
    {
      title: "5. Other Details",
      fields: [
        { name: "languagesProficientIn", label: "a) Indicate the language(s) you are proficient in", required: true, maxLength: 500, placeholder: "e.g. English, Kiswahili", full: true },
        ...yesWith("disabled", "b) Do you suffer from any physical impairment?", [
          details("disabilityType"),
          { name: "pwdNumber", label: "NCPWD registration number (if any)", required: false, maxLength: 250 },
        ]),
        ...yesWith("interviewedAtKCIC", "c) Have you ever interviewed for a position or worked at the KCIC before?", [
          { name: "kcicPositionApplied", label: "State the position", maxLength: 100 },
          { name: "kcicInterviewDate", label: "Date", type: "date" },
        ]),
        ...yesWith("relativeAtKCIC", "d) Do you have any relative(s) currently working at KCIC?", [details("relativeAtKCICDetails")]),
        ...yesWith("conflictOfInterest", "e) Do you have any conflict of interest whatsoever with KCIC related to this application?", [details("conflictOfInterestDetails")]),
        ...yesWith("dismissedFromEmployment", "f) Have you ever been dismissed or otherwise removed from employment?", [
          details("dismissalReason", "State reason(s) for dismissal / removal"),
          { name: "dismissalDate", label: "Effective date", type: "date" },
        ]),
        ...yesWith("litigationLast3Years", "g) Within the last three years, has administrative, civil or criminal litigation been filed against you?", [details("litigationDetails")]),
        ...yesWith("convictedLast3Years", "h) Within the last three years have you been convicted?", [details("convictionDetails")]),
      ],
    },
    {
      title: "i) Have you ever been formally accused of, or investigated or sanctioned for:",
      intro: "Declaring the above information will not necessarily debar an applicant from employment at KCIC. Each case will be considered on its own merit. The information provided will be treated as confidential and according to any applicable laws and regulations, in particular data protection laws and regulations.",
      fields: accusations.map(([name, label]) => ({ name, label, type: "yesno", full: true })),
    },
  ],
  toPayload: (v) => ({ ...v, kcicInterviewDate: dateOrNull(v.kcicInterviewDate), dismissalDate: dateOrNull(v.dismissalDate) }),
};

// ── Section 6: academic / professional / technical qualifications ──────────
// AddAcademicQualification: course → Course + "Qualification Attained", areaOfStudy → Subject/Specialization,
// courseDescription → Training Details (used here for the form's "Courses" column, e.g. MSc).
export const academicQualifications = {
  title: "Academic Qualifications",
  itemLabel: "Qualification",
  minimumLabel: "qualifications",
  intro: "6. Academic / professional / technical qualifications, starting with the highest.",
  listPath: "academic-qualifications",
  addPath: "add-academic-qualification",
  deletePath: (row, applicationNo) => `delete-academic-qualification?applicationNo=${enc(applicationNo)}&lineNo=${enc(row.lineNo)}`,
  rowKey: (row) => row.lineNo,
  dateRange: { allowFutureEnd: true },
  fields: [
    { name: "startDate", label: "From", type: "date", required: true },
    { name: "endDate", label: "To", type: "date", required: true },
    { name: "institution", label: "University / college / institution / school", required: true, maxLength: 100 },
    { name: "level", label: "Qualification attained", type: "select", options: AcademicLevelOptions, required: true },
    { name: "courseDescription", label: "Course (e.g. PhD, MSc, BA)", required: true, maxLength: 250 },
    { name: "areaOfStudy", label: "Subject (area of specialisation)", required: true, maxLength: 100 },
    { name: "grade", label: "Class / grade", required: true, maxLength: 30 },
  ],
  columns: [
    ["startDate", "From"], ["endDate", "To"], ["institution", "Institution"], ["description", "Qualification"],
    ["courseDescription", "Course"], ["areaOfStudy", "Subject"], ["grade", "Class / grade"],
  ],
  toPayload: (v) => ({
    level: v.level, areaOfStudy: v.areaOfStudy, institution: v.institution, startDate: v.startDate,
    endDate: v.endDate, grade: v.grade, courseDescription: v.courseDescription,
  }),
};

// ── Section 7: other relevant courses, training, professional memberships ──
export const professionalTraining = {
  title: "Courses, Training and Memberships",
  itemLabel: "Course / membership",
  minimumLabel: "courses",
  intro: "7. Other relevant courses and training / registration / membership to professional bodies (optional).",
  listPath: "professional-training",
  addPath: "add-professional-training",
  deletePath: (row, applicationNo) => `delete-professional-training?applicationNo=${enc(applicationNo)}&lineNo=${enc(row.lineNo)}`,
  rowKey: (row) => row.lineNo,
  fields: [
    { name: "year", label: "Year", type: "number", required: true, min: 1950, max: thisYear },
    { name: "institution", label: "Institution / college", required: true, maxLength: 100 },
    { name: "description", label: "Course / registration / membership", required: true, maxLength: 80, placeholder: "e.g. CPA (K), ICPAK membership" },
    { name: "trainingDescription", label: "Details", maxLength: 250, full: true },
  ],
  validate: (v) => {
    const year = Number(v.year);
    return !isBlank(v.year) && (!Number.isInteger(year) || year < 1950 || year > thisYear)
      ? { year: `Enter a year between 1950 and ${thisYear}.` } : {};
  },
  columns: [["year", "Year"], ["institution", "Institution / college"], ["description", "Course"], ["trainingDescription", "Details"]],
  toPayload: (v) => ({
    year: Number(v.year), institution: v.institution, description: v.description,
    professionalMembership: "", trainingDescription: v.trainingDescription,
  }),
};

// ── Section 8: employment details ──────────────────────────────────────────
export const workExperience = {
  title: "Employment History",
  itemLabel: "Employment record",
  minimumLabel: "employment records",
  intro: "8. Employment details, starting with the most recent.",
  listPath: "work-experience",
  addPath: "add-work-experience",
  deletePath: (row, applicationNo) => `delete-work-experience?applicationNo=${enc(applicationNo)}&lineNo=${enc(row.lineNo)}`,
  rowKey: (row) => row.lineNo,
  dateRange: {},
  fields: [
    { name: "startDate", label: "From", type: "date", required: true },
    { name: "endDate", label: "To", type: "date", required: true, show: (v) => !v.isCurrent },
    { name: "isCurrent", label: "I currently work here", type: "checkbox" },
    { name: "institution", label: "Employer's name", required: true, maxLength: 150 },
    { name: "position", label: "Position / rank / designation", required: true, maxLength: 250 },
    { name: "salary", label: "Gross monthly salary (Ksh)", type: "number", required: true, min: 0, step: "any" },
    { name: "responsibility", label: "Main responsibilities", type: "textarea", maxLength: 500, rows: 2 },
  ],
  columns: [
    ["startDate", "From"], ["endDate", "To", (row) => (row.isCurrent ? "Present" : row.endDate)],
    ["institution", "Employer"], ["position", "Position"],
    ["salary", "Gross monthly salary", (row) => (Number(row.salary) ? Number(row.salary).toLocaleString() : "")],
  ],
  toPayload: (v) => ({
    position: v.position, institution: v.institution, startDate: v.startDate,
    endDate: v.isCurrent ? null : dateOrNull(v.endDate), isCurrent: !!v.isCurrent,
    responsibility: v.responsibility, salary: amount(v.salary),
  }),
};

// ── Sections 9 and 10: current duties; abilities, skills and experience ────
export const dutiesAndAbilities = {
  savePath: "update-duties-abilities",
  fromDetails: (d) => ({ currentDuties: d.CurrentDuties || "", abilitiesAndSkills: d.AbilitiesAndSkills || "" }),
  sections: [
    {
      title: "9. Current duties, responsibilities and assignments",
      intro: "Briefly state your current duties, responsibilities and assignments. Leave blank if you are not currently employed.",
      fields: [{ name: "currentDuties", label: "Current duties", type: "textarea", maxLength: 2048, rows: 6 }],
    },
    {
      title: "10. Abilities, skills and experience",
      intro: "Give details of your abilities, skills and experience which you consider are relevant to the position applied for. You may include an outline of your most recent achievements and your reasons for applying.",
      fields: [{ name: "abilitiesAndSkills", label: "Abilities, skills and experience", type: "textarea", required: true, maxLength: 2048, rows: 8 }],
    },
  ],
  toPayload: (v) => ({ currentDuties: v.currentDuties, abilitiesAndSkills: v.abilitiesAndSkills }),
};

// ── Section 11: personal references ────────────────────────────────────────
// InsertApplicationReferee joins first/middle/last into one name, so the form's "Full Name" is sent as firstName.
export const referees = {
  title: "Personal References",
  itemLabel: "Referee",
  minimumLabel: "referees",
  intro: "11. The names of distinguished persons should not be used unless they really know you well; the names of relatives or of those from whom you send testimonials should not be used.",
  listPath: "referees",
  addPath: "add-referee",
  deletePath: (row, applicationNo) => `delete-referee?applicationNo=${enc(applicationNo)}&id=${enc(row.id)}`,
  rowKey: (row) => row.id,
  fields: [
    { name: "fullName", label: "Full Name", required: true, maxLength: 200 },
    { name: "address", label: "Address", required: true, maxLength: 200 },
    { name: "phoneNo", label: "Telephone No", type: "tel", required: true, hint: "Kenyan number, e.g. 0712 345 678." },
    { name: "email", label: "E-mail", type: "email", required: true, maxLength: 100 },
    { name: "occupation", label: "Occupation", required: true, maxLength: 100 },
    { name: "periodKnown", label: "Period for which he/she has known you", required: true, maxLength: 30, placeholder: "e.g. 5 years" },
  ],
  validate: (v) => (isBlank(v.email) || EMAIL.test(String(v.email).trim()) ? {} : { email: "Enter a valid email address." }),
  columns: [
    ["names", "Full name"], ["address", "Address"], ["phoneNo", "Telephone"], ["email", "E-mail"],
    ["occupation", "Occupation"], ["periodKnown", "Known for"],
  ],
  toPayload: (v) => ({
    firstName: v.fullName.trim().replace(/\s+/g, " "), middleName: "", lastName: "", occupation: v.occupation,
    institution: "", periodKnown: v.periodKnown, phoneNo: v.phoneNo, email: v.email, address: v.address,
  }),
};
