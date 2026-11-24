import test from "node:test";
import assert from "node:assert/strict";
import {
  personalRequiredFields, validatePersonalDetails, validateBirthDate, salutationValue, salutationText,
  isBlank, missingRequiredDocuments
} from "./applicationValidation.js";
import { GenderOptions, MaritalStatusOptions, optionValue } from "../constants/enums.js";

const today = new Date(2026, 5, 15);
const completeProfile = () => ({
  ...Object.fromEntries(personalRequiredFields.map(([key]) => [key, "value"])),
  initials: 0, birthDate: "2008-06-15"
});

test("all mandatory personal fields reject empty and whitespace values", () => {
  for (const [key] of personalRequiredFields) {
    for (const value of ["", "   ", null, undefined]) {
      assert.ok(validatePersonalDetails({ ...completeProfile(), [key]: value }, today)[key], key);
    }
  }
});

test("middle name is optional, and zero salutation is preserved", () => {
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

test("conditional disability fields are enforced only when a disability is declared", () => {
  const errors = validatePersonalDetails({ ...completeProfile(), disability: "true" }, today);
  for (const key of ["pwdNumber", "disabilityStatus"]) assert.ok(errors[key]);
  assert.deepEqual(validatePersonalDetails({ ...completeProfile(), disability: "false" }, today), {});
});

test("fields Business Central does not store are not required", () => {
  for (const key of ["ethnicity", "currentSalary", "expectedSalary", "noticePeriod", "subCounty", "wardCode", "altPhoneNumber"]) {
    assert.ok(!personalRequiredFields.some(([field]) => field === key), key);
  }
});

test("DOB validates actual calendar and exact eighteenth birthday", () => {
  assert.equal(validateBirthDate("2008-06-15", today), "");
  assert.match(validateBirthDate("2008-06-16", today), /18/);
  assert.match(validateBirthDate("2008-02-30", today), /valid/);
  assert.match(validateBirthDate("2030-01-01", today), /18/);
  assert.match(validateBirthDate("1900-01-01", today), /valid/);
});

test("required document categories must each have an upload", () => {
  const context = { DocumentCategories: [
    { Required: true, Code: "CV", Description: "CV" },
    { Required: false, Code: "OTHER", Description: "Other" }
  ] };
  assert.equal(missingRequiredDocuments(context, [{ requirementCode: "OTHER" }]).length, 1);
  assert.deepEqual(missingRequiredDocuments(context, [{ requirementCode: "CV" }]), []);
  assert.deepEqual(missingRequiredDocuments({}, []), []);
});

test("gender and marital status use Business Central option values", () => {
  assert.equal(optionValue(GenderOptions, "Male"), "1");
  assert.equal(optionValue(GenderOptions, "Female"), "2");
  assert.equal(optionValue(GenderOptions, " "), "");
  assert.equal(optionValue(MaritalStatusOptions, "Widow(er)"), "5");
  assert.equal(optionValue(MaritalStatusOptions, "2"), "2");
  assert.equal(optionValue(MaritalStatusOptions, "Complicated"), "");
});
