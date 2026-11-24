import test from "node:test";
import assert from "node:assert/strict";
import { apiFetch, readJson, resultError } from "./http.js";

globalThis.window = { location: { origin: "http://127.0.0.1:1" } };

test("network failures report the URL and the underlying cause, not just 'fetch failed'", async () => {
  await assert.rejects(apiFetch("http://127.0.0.1:59999/api/job/advertisedjobs"), (error) => {
    assert.match(error.message, /^Could not reach http:\/\/127\.0\.0\.1:59999\/api\/job\/advertisedjobs: /);
    assert.match(error.message, /ECONNREFUSED/);
    return true;
  });
});

test("aborted requests are passed through unchanged", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(apiFetch("http://127.0.0.1:59999/api/x", { signal: controller.signal }), { name: "AbortError" });
});

test("non-JSON responses report status, URL and body text", async () => {
  const response = new Response("<html><h1>502 Bad Gateway</h1></html>", { status: 502, statusText: "Bad Gateway" });
  await assert.rejects(readJson(response), /HTTP 502 Bad Gateway - 502 Bad Gateway/);
  await assert.rejects(readJson(new Response("", { status: 500 })).then((r) => { throw new Error(resultError(r, { status: 500, statusText: "", url: "" })); }), /HTTP 500/);
});

test("API error messages are returned as-is", () => {
  assert.equal(resultError({ success: false, message: "User with email address x not found!" }), "User with email address x not found!");
});
