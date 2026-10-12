import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const RULES = [
  {
    id: "TEST_FAILURE",
    pattern: /\b(test failed|tests failed|assertion failed|assertion error|failed tests?)\b/i,
    severity: "high",
    title: "Automated test failure",
    recommendation:
      "Inspect the failing test, expected versus actual values, and the related code changes."
  },
  {
    id: "MISSING_COMPONENT",
    pattern: /\b(component not found|no such file|cannot find module|missing component|does not exist)\b/i,
    severity: "high",
    title: "Missing component or dependency",
    recommendation:
      "Verify component names, file paths, package dependencies, and deployment contents."
  },
  {
    id: "PERMISSION_ERROR",
    pattern: /\b(permission denied|insufficient privileges|access denied|unauthorized|forbidden)\b/i,
    severity: "high",
    title: "Permission or authorization error",
    recommendation:
      "Check the configured identity, required permissions, and access to the target environment."
  },
  {
    id: "TIMEOUT",
    pattern: /\b(timed out|timeout|deadline exceeded)\b/i,
    severity: "medium",
    title: "Operation timed out",
    recommendation:
      "Check service availability, job duration, network connectivity, and configured time limits."
  },
  {
    id: "DEPENDENCY_ERROR",
    pattern: /\b(dependency conflict|version conflict|unresolved dependency|dependency not found)\b/i,
    severity: "medium",
    title: "Dependency conflict",
    recommendation:
      "Check required package versions and ensure dependencies are available in the target environment."
  }
];

export function analyzeLog(content) {
  if (typeof content !== "string") {
    throw new TypeError("Log content must be a string.");
  }

  const lines = content.split(/\r?\n/);
  const findings = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        findings.push({
          ruleId: rule.id,
          severity: rule.severity,
          title: rule.title,
          line: index + 1,
          evidence: line.trim().slice(0, 500),
          recommendation: rule.recommendation
        });
      }
    }
  }

  const highCount = findings.filter(
    (item) => item.severity === "high"
  ).length;

  const mediumCount = findings.filter(
    (item) => item.severity === "medium"
  ).length;

  const riskScore = Math.min(
    100,
    highCount * 40 + mediumCount * 15
  );

  const riskLevel =
    riskScore >= 70
      ? "HIGH"
      : riskScore >= 30
        ? "MEDIUM"
        : riskScore > 0
          ? "LOW"
          : "MINIMAL";

  return {
    tool: "ReleasePilot AI",
    mode: "local-log-analysis",
    analyzedAt: new Date().toISOString(),

    riskAssessment: {
      score: riskScore,
      level: riskLevel,
      explanation:
        "Score is based on detected log patterns, not a live deployment prediction."
    },

    summary: {
      linesAnalyzed: lines.length,
      findings: findings.length,
      high: highCount,
      medium: mediumCount,
      status: findings.length
        ? "issues-detected"
        : "no-known-patterns-detected"
    },

    findings,

    disclaimer:
      "Local pattern-based diagnostics only; this is not a live Copado deployment status."
  };
}

function printUsage() {
  console.log(
    "Usage: node src/analyzer.js <log-file> [--json-out <report-file>]"
  );
}

function main(args) {
  const input = args[0];

  if (!input || input === "--help") {
    printUsage();
    return;
  }

  const outputFlag = args.indexOf("--json-out");
  const output = outputFlag >= 0 ? args[outputFlag + 1] : null;

  if (outputFlag >= 0 && !output) {
    throw new Error("Provide a path after --json-out.");
  }

  const content = fs.readFileSync(input, "utf8");
  const report = analyzeLog(content);
  const json = JSON.stringify(report, null, 2);

  if (output) {
    const destination = path.resolve(output);

    fs.mkdirSync(path.dirname(destination), {
      recursive: true
    });

    fs.writeFileSync(destination, `${json}\n`, "utf8");

    console.log(`Diagnostic report written to ${destination}`);
  }

  console.log(json);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`ReleasePilot AI: ${error.message}`);
    process.exitCode = 1;
  }
}