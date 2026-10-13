---
name: releasepilot-diagnostics
description: Analyze deployment logs, classify release failures, assess deployment risk, explain likely root causes, and recommend evidence-based remediation steps using ReleasePilot AI.
---

# ReleasePilot Diagnostics

## Purpose

Help developers investigate deployment failures using ReleasePilot AI's local analysis and AI-assisted explanations.

## Workflow

1. Identify the deployment log or failure report supplied by the user.
2. Use the existing ReleasePilot analyzer to identify known error patterns.
3. Review the detected error types, severity levels, and risk score.
4. Explain the most likely root cause using evidence from the supplied log.
5. Recommend specific remediation steps that address the observed failure.
6. Distinguish confirmed log evidence from hypotheses.
7. Identify missing information and suggest additional checks when the root cause is uncertain.

## Diagnostic rules

- Treat test failures, missing components, and permission errors as high-severity findings.
- Treat timeouts and dependency errors as medium-severity findings.
- Follow the scoring formula implemented in `src/analyzer.js`; do not invent a different score.
- Use the actual application output and test results rather than assuming a deployment succeeded.
- Do not claim to have inspected a live Copado organization unless a verified integration was used.

## Security

- Never print, request, or expose API keys, access tokens, passwords, or other secrets.
- Redact sensitive values before sharing logs or reports.
- Do not execute deployments, modify production environments, or change credentials without explicit authorization.

## Response format

For each analysis, provide:

1. **Summary** — what failed and the overall risk.
2. **Evidence** — relevant error messages and detected patterns.
3. **Likely root cause** — distinguish evidence from inference.
4. **Recommended fixes** — ordered by priority.
5. **Validation** — how to confirm that the fix worked.
6. **Limitations** — anything that could not be verified.
