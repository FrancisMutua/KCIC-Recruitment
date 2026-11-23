import test from "node:test";
import assert from "node:assert/strict";
import { parseBcDate, daysUntil, deadlineLabel, formatDate, learnDateOrder, resetDateOrder, toIsoDate } from "./bcDate.js";

const today = new Date(2026, 10, 23); // 23 Nov 2026

test("parses BC month-first, unambiguous day-first, and ISO dates", () => {
  assert.deepEqual(parseBcDate("11/30/26"), new Date(2026, 10, 30));
  assert.deepEqual(parseBcDate("30/11/26"), new Date(2026, 10, 30));
  assert.deepEqual(parseBcDate("2026-11-30T00:00:00Z"), new Date(2026, 10, 30));
  assert.equal(parseBcDate(""), null);
  assert.equal(parseBcDate("02/30/26"), null);
});

test("deadline labels count whole days", () => {
  assert.equal(daysUntil("11/30/26", today), 7);
  assert.equal(deadlineLabel("11/30/26", today), "7 days left");
  assert.equal(deadlineLabel("11/24/26", today), "Closes tomorrow");
  assert.equal(deadlineLabel("11/23/26", today), "Closes today");
  assert.equal(deadlineLabel("11/22/26", today), "Closed");
  assert.equal(deadlineLabel("n/a", today), "");
});

test("formats for display and keeps unknown text", () => {
  assert.equal(formatDate("11/30/26"), "30 Nov 2026");
  assert.equal(formatDate("soon"), "soon");
});

test("ambiguous dates follow the order proven by other dates", () => {
  resetDateOrder();
  assert.deepEqual(parseBcDate("05/01/27"), new Date(2027, 4, 1)); // default month-first
  assert.equal(learnDateOrder(["01/11/26", "25/11/26", "05/01/27"]), true);
  assert.deepEqual(parseBcDate("05/01/27"), new Date(2027, 0, 5));
  resetDateOrder();
  assert.equal(learnDateOrder(["11/25/26"]), false);
  assert.deepEqual(parseBcDate("05/01/27"), new Date(2027, 4, 1));
  resetDateOrder();
});

test("two-digit birth years resolve to the 1900s, recent years to the 2000s", () => {
  resetDateOrder();
  assert.deepEqual(parseBcDate("05/04/90"), new Date(1990, 4, 4));
  assert.deepEqual(parseBcDate("11/30/26"), new Date(2026, 10, 30));
  assert.equal(toIsoDate("05/04/90"), "1990-05-04");
  assert.equal(toIsoDate(""), "");
});
