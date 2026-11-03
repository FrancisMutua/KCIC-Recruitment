import { test } from "node:test";
import assert from "node:assert/strict";
import { getRefereeSubmissionStatus } from "./refereeValidation.js";

test("blocks below the configured minimum and reports the shortfall", () => {
  const status = getRefereeSubmissionStatus(3, 2);
  assert.equal(status.blocked, true);
  assert.match(status.message, /Add 1 more referee before submitting/);
  assert.match(status.message, /2 of the minimum 3/);
});

test("allows exactly the minimum, more than the minimum, and a zero minimum", () => {
  for (const [minimum, count] of [[3, 3], [3, 4], [0, 0]]) {
    assert.deepEqual(getRefereeSubmissionStatus(minimum, count), { blocked: false, message: "" });
  }
});

test("blocks and reports missing or invalid configuration", () => {
  for (const minimum of [undefined, null, -1, 1.5, "3"]) {
    const status = getRefereeSubmissionStatus(minimum, 3);
    assert.equal(status.blocked, true);
    assert.match(status.message, /could not be loaded/);
  }
});
