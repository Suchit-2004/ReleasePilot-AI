import test from "node:test";
import assert from "node:assert/strict";
import { analyzeLog } from "../src/analyzer.js";

test("detects test failures and missing components", () => {
  const report = analyzeLog(
    "[ERROR] Test failed: AccountServiceTest\n" +
    "[ERROR] Component not found: AccountSummary"
  );

  assert.equal(report.summary.findings, 2);
  assert.equal(report.summary.high, 2);
  assert.deepEqual(
    report.findings.map((item) => item.ruleId),
    ["TEST_FAILURE", "MISSING_COMPONENT"]
  );
});

test("reports no known patterns in a clean log", () => {
  const report = analyzeLog("[INFO] Validation completed successfully");

  assert.equal(report.summary.findings, 0);
  assert.equal(report.summary.status, "no-known-patterns-detected");
});

test("records line numbers correctly", () => {
  const report = analyzeLog(
    "Starting\nAll good\n[ERROR] Permission denied"
  );

  assert.equal(report.findings[0].line, 3);
  assert.equal(report.findings[0].ruleId, "PERMISSION_ERROR");
});

test("rejects non-string input", () => {
  assert.throws(() => analyzeLog(null), TypeError);
});