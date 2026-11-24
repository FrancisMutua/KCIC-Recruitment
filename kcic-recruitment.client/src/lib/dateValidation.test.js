import { test } from "node:test";
import assert from "node:assert/strict";
import { validateDateRange } from "./dateValidation.js";

const today = new Date(2026, 9, 5, 12);
const validate = (values, options = {}) => validateDateRange(values, { today, ...options });

test("reports both missing fields", () => {
  assert.deepEqual(Object.keys(validate({})), ["startDate", "endDate"]);
});

test("rejects invalid and impossible dates", () => {
  assert.match(validate({ startDate: "2026-02-30", endDate: "invalid" }).startDate, /valid/);
  assert.match(validate({ startDate: "2026-02-30", endDate: "invalid" }).endDate, /valid/);
});

test("accepts today regardless of timezone", () => {
  assert.deepEqual(validate({ startDate: "2026-10-04", endDate: "2026-10-05" }), {});
});

test("rejects equal or reversed ranges on the end field", () => {
  for (const endDate of ["2026-10-01", "2026-09-30"]) {
    assert.match(validate({ startDate: "2026-10-01", endDate }).endDate, /after/);
  }
});

test("reports future dates on their respective fields", () => {
  const errors = validate({ startDate: "2026-10-06", endDate: "2026-10-07" });
  assert.match(errors.startDate, /future/);
  assert.match(errors.endDate, /future/);
});

test("allows future academic completion but not future start", () => {
  assert.deepEqual(validate({ startDate: "2026-01-01", endDate: "2027-01-01" }, { allowFutureEnd: true }), {});
  assert.match(validate({ startDate: "2026-10-06", endDate: "2027-01-01" }, { allowFutureEnd: true }).startDate, /future/);
});

test("current employment ignores end date but validates start", () => {
  assert.deepEqual(validate({ startDate: "2026-01-01", isCurrent: true }), {});
  assert.match(validate({ startDate: "invalid", isCurrent: true }).startDate, /valid/);
});

test("live validation does not require untouched fields", () => {
  assert.deepEqual(validate({}, { required: false }), {});
});
