import test from "node:test";
import assert from "node:assert/strict";
import {
  personalRequiredFields, validatePersonalDetails, validateBirthDate, salutationValue, salutationText,
  isBlank, validateResponses, missingRequiredDocuments, applicationMandatoryErrors
} from "./applicationValidation.js";

const today = new Date(2026, 5, 15);
const completeProfile = () => ({
  ...Object.fromEntries(personalRequiredFields.map(([key]) => [key, "value"])),
  initials: 0, currentSalary: 0, expectedSalary: 0, birthDate: "2008-06-15"
});

test("all mandatory personal fields reject empty and whitespace values", () => {
  for (const [key] of personalRequiredFields) {
    for (const value of ["", "   ", null, undefined]) {
      assert.ok(validatePersonalDetails({ ...completeProfile(), [key]: value }, today)[key], key);
    }
  }
});

test("middle name is optional, and zero salutation/salary are preserved", () => {
  assert.deepEqual(validatePersonalDetails(completeProfile(), today), {});
  for (const value of [0, "0", "Mr", "Mr."]) assert.equal(salutationValue(value), "0");
  assert.equal(salutationValue("Prof."), "4");
  assert.equal(salutationValue("Mrs."), "1");
  assert.equal(salutationValue("Miss."), "2");
  assert.equal(salutationText(1), "Mrs.");
  assert.equal(salutationText(2), "Miss.");
  assert.equal(salutationValue("unknown"), "");
  assert.equal(salutationText("unknown"), "");
  assert.equal(salutationText(""), "");
  assert.equal(isBlank(0), false);
  assert.equal(isBlank("  "), true);
});

test("conditional disability fields and invalid amounts are enforced", () => {
  const profile = { ...completeProfile(), disability: "true", expectedSalary: -1, currentSalary: "NaN" };
  const errors = validatePersonalDetails(profile, today);
  for (const key of ["pwdNumber", "disabilityStatus", "expectedSalary", "currentSalary"]) assert.ok(errors[key]);
});

test("DOB validates actual calendar and exact eighteenth birthday", () => {
  assert.equal(validateBirthDate("2008-06-15", today), "");
  assert.match(validateBirthDate("2008-06-16", today), /18/);
  assert.match(validateBirthDate("2008-02-30", today), /valid/);
  assert.match(validateBirthDate("2030-01-01", today), /18/);
  assert.match(validateBirthDate("1900-01-01", today), /valid/);
});

test("required answers and configured consents are enforced, No and zero are valid answers", () => {
  const answers = [
    { Kind: "requirement", LineNo: 1, Required: true, Has: 0 },
    { Kind: "question", LineNo: 2, Required: true, ResponseType: "Number", Answer: " " }
  ];
  const context = { DataConsentRequired: true, ReferenceConsentRequired: true };
  assert.equal(Object.keys(validateResponses(answers, {}, context)).length, 4);
  assert.deepEqual(validateResponses([
    { ...answers[0], Has: 1 }, { ...answers[1], Answer: "0" }
  ], { DataConsent: true, ReferenceConsent: true }, context), {});
  assert.deepEqual(validateResponses([{ Kind: "question", LineNo: 3, Required: false, Answer: "" }], {}, {}), {});
});

test("required uploads match the advert requirement code", () => {
  const context = { RequiredDocuments: [{ Required: true, Code: "CERT", Description: "Certificate" }] };
  assert.equal(missingRequiredDocuments(context, [{ requirementCode: "" }]).length, 1);
  assert.deepEqual(missingRequiredDocuments(context, [{ requirementCode: "CERT" }]), []);
});

test("final mandatory checks do not depend on optional completeness settings", () => {
  const errors = applicationMandatoryErrors(completeProfile(), {
    EnforceCompleteness: false, DataConsentRequired: true, ProfessionalQualificationMandatory: true
  }, [], [], today);
  assert.equal(errors.length, 2);
});

test("a complete application with optional middle name and zero salary can submit", () => {
  const context = {
    DataConsentRequired: true, ReferenceConsentRequired: true,
    DataConsent: true, ReferenceConsent: true, ProfessionalQualificationMandatory: true,
    MinimumRequirements: [{ LineNo: 1, Required: true, Has: 2 }],
    Questions: [{ LineNo: 2, Required: true, ResponseType: "Number", Answer: "0" }],
    RequiredDocuments: [{ Code: "CERT", Required: true }]
  };
  assert.deepEqual(applicationMandatoryErrors(
    completeProfile(), context, [{ requirementCode: "CERT" }], [{ Description: "Training" }], today
  ), []);
});
