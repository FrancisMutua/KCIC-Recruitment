import test from "node:test";
import assert from "node:assert/strict";
import { advertLines, advertRows, advertFields, fixText } from "./jobAdvert.js";

test("numbering and colon prefixes are removed without exposing requirement codes", () => {
  assert.deepEqual(advertLines([
    { code: "0", description: "0: A degree" },
    { Description: "  2. Experience\n• Communication\n- Teamwork" },
    { description: " \n " }, { description: ": Integrity" }
  ]), ["A degree", "Experience", "Communication", "Teamwork", "Integrity"]);
});

test("genuine quantities and unicode punctuation remain unchanged", () => {
  assert.deepEqual(advertLines([
    { description: "3 years’ experience" }, { description: "3.5 years of experience" }
  ]), ["3 years’ experience", "3.5 years of experience"]);
});

test("actual and SOAP string arrays are supported; malformed JSON is explicit", () => {
  assert.deepEqual(advertRows('[{"Description":"Certificate"}]'), [{ Description: "Certificate" }]);
  assert.deepEqual(advertRows([]), []);
  assert.throws(() => advertRows("broken"), SyntaxError);
});

test("advert metadata keeps labels and leaves unavailable BC values blank", () => {
  const fields = Object.fromEntries(advertFields({
    requisitionType: "Both", dutyStation: "", basicSalary: null,
    allowances: undefined, employmentTerms: "   "
  }));
  assert.equal(fields["Requisition type"], "Both");
  for (const label of ["Duty station", "Basic salary", "Allowances", "Terms of employment"]) {
    assert.equal(fields[label], "");
  }
});

test("BC text and numeric values are displayed without substitutions", () => {
  const fields = Object.fromEntries(advertFields({
    dutyStation: "Main Campus", employmentTerms: "Fixed-term",
    basicSalary: 123456.75, allowances: 0
  }));
  assert.equal(fields["Duty station"], "Main Campus");
  assert.equal(fields["Terms of employment"], "Fixed-term");
  assert.equal(fields["Basic salary"], "123456.75");
  assert.equal(fields.Allowances, "0");
});

test("mis-decoded dashes and quotes are repaired", () => {
  assert.deepEqual(advertLines([{ description: "1. 1ËÇô3 years of acute care or hospital nursing experience preferred (New graduates welcome to apply for our Nurse Residency Program)." }]),
    ["1–3 years of acute care or hospital nursing experience preferred (New graduates welcome to apply for our Nurse Residency Program)."]);
  assert.equal(fixText("Registered Nurse (RN) ËÇô Inpatient Care"), "Registered Nurse (RN) – Inpatient Care");
  assert.equal(fixText("1â€“3 yearsâ€™ work"), "1–3 years’ work");
  assert.equal(fixText(null), "");
});
