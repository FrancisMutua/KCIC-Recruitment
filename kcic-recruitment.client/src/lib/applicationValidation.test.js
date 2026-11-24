import test from "node:test";
import assert from "node:assert/strict";
import {
  personalRequiredFields, validatePersonalDetails, validateBirthDate, salutationValue,
  isBlank, missingRequiredDocuments
} from "./applicationValidation.js";
import { GenderOptions, MaritalStatusOptions, optionValue } from "../constants/enums.js";

const today = new Date(2026, 5, 15);
const completeProfile = () => ({
  ...Object.fromEntries(personalRequiredFields.map(([key]) => [key, "value"])),
  initials: "Mr.", birthDate: "2008-06-15"
});

test("all mandatory personal fields reject empty and whitespace values", () => {
  for (const [key] of personalRequiredFields) {
    for (const value of ["", "   ", null, undefined]) {
      assert.ok(validatePersonalDetails({ ...completeProfile(), [key]: value }, today)[key], key);
    }
  }
});

test("middle name is optional, and salutations match the codeunit's titles", () => {
  assert.deepEqual(validatePersonalDetails(completeProfile(), today), {});
  for (const value of ["Mr", "Mr.", "mr."]) assert.equal(salutationValue(value), "Mr.");
  assert.equal(salutationValue("Prof."), "Prof");
  assert.equal(salutationValue("Miss."), "Miss");
  assert.equal(salutationValue("unknown"), "");
  assert.equal(salutationValue(""), "");
  assert.ok(validatePersonalDetails({ ...completeProfile(), initials: "Sir" }, today).initials);
  assert.equal(isBlank(0), false);
  assert.equal(isBlank("  "), true);
});

test("fields the KCIC form does not ask for are optional", () => {
  for (const key of ["kraPin", "maritalStatus", "citizenship", "country", "county", "altPhoneNumber", "altContactPerson"]) {
    assert.ok(!personalRequiredFields.some(([field]) => field === key), key);
  }
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

test("gender and marital status use the text codeunit 70007 maps", () => {
  assert.equal(optionValue(GenderOptions, "Male"), "Male");
  assert.equal(optionValue(GenderOptions, "female"), "Female");
  assert.equal(optionValue(GenderOptions, " "), "");
  // MaritalStatusToText returns "Widow" for Widow(er) and "Complicated" for Other.
  assert.equal(optionValue(MaritalStatusOptions, "Widow"), "Widow");
  assert.equal(optionValue(MaritalStatusOptions, "Complicated"), "Complicated");
  // "Separated" cannot be saved through the codeunit, so it is not offered.
  assert.equal(optionValue(MaritalStatusOptions, "Separated"), "");
});
