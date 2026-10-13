# ReleasePilot AI 🚀

### AI-Powered Deployment Diagnostics for Copado Release Workflows

**Identify deployment blockers. Understand likely root causes. Ship with
greater confidence.**

ReleasePilot AI is an AI-assisted deployment-log diagnostics platform.
It combines deterministic local log analysis with Google's Gemini API to
identify common deployment issues, estimate a heuristic risk score, and
provide troubleshooting guidance.

> **Project status:** Hackathon prototype. Local log analysis and
> Gemini-assisted explanations are implemented. A live Copado or
> Salesforce deployment connection is not currently implemented.

## Table of Contents

-   [Overview](#overview)
-   [Problem Statement](#problem-statement)
-   [Solution](#solution)
-   [Features](#features)
-   [How It Works](#how-it-works)
-   [Architecture](#architecture)
-   [Risk Scoring](#risk-scoring)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Getting Started](#getting-started)
-   [Using the Dashboard](#using-the-dashboard)
-   [API Documentation](#api-documentation)
-   [Testing](#testing)
-   [Security and Privacy](#security-and-privacy)
-   [Limitations](#limitations)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)
-   [License](#license)

## Overview

Deployment failures can involve missing components, failed automated
tests, permission problems, dependency errors, or timeouts. Manually
inspecting logs to find the important messages can slow down
troubleshooting.

ReleasePilot AI provides two complementary layers:

1.  **Rule-based diagnostics** identify supported error patterns,
    extract evidence, and calculate a deterministic risk score.
2.  **Gemini AI analysis** interprets structured findings and suggests
    likely root causes, recommended actions, and caveats.

### Project at a glance

  Attribute                Details
  ------------------------ ---------------------------------------------------------
  Project name             ReleasePilot AI
  Category                 AI / Developer Tools / DevOps
  Application              Web-based diagnostics dashboard
  Backend                  Node.js built-in HTTP server
  Frontend                 HTML, CSS, JavaScript
  AI provider              Google Gemini API
  Inputs                   Pasted logs or `.log` / `.txt` files
  Input limit              1 MB
  Outputs                  Risk assessment, findings, recommendations, JSON report
  Live Copado connection   Not implemented

## Problem Statement

Developers may need to inspect deployment logs manually to find errors
that prevent a release. This can make it difficult to:

-   Find important errors among informational messages.
-   Investigate missing metadata or components.
-   Understand automated test failures.
-   Diagnose timeouts and dependency problems.
-   Prioritize issues that need attention.

## Solution

ReleasePilot AI lets users submit a deployment log, scans it for known
patterns, calculates a risk score, and requests AI-assisted explanations
from Gemini when configured. Results appear in a dashboard and can be
exported as JSON.

## Features

  -----------------------------------------------------------------------
  Feature                             Description
  ----------------------------------- -----------------------------------
  Log upload                          Upload `.log` or `.txt` files up to
                                      1 MB

  Paste log content                   Analyze text directly in the
                                      dashboard

  Sample log                          Demonstrate the application with
                                      included sample data

  Pattern detection                   Detect supported test, component,
                                      permission, timeout, and dependency
                                      errors

  Severity classification             Label findings as high or medium

  Risk scoring                        Calculate a score from 0 to 100
                                      using predefined rules

  AI root-cause analysis              Generate likely causes and
                                      investigation suggestions with
                                      Gemini

  AI fallback                         Keep local findings available when
                                      AI is unavailable

  Interactive dashboard               View risk, evidence, line numbers,
                                      and recommendations

  JSON export                         Download a diagnostic report
  -----------------------------------------------------------------------

## How It Works

``` mermaid
flowchart TD
    A([Start]) --> B[Upload or paste deployment log]
    B --> C{Valid input and size?}
    C -- No --> D[Display validation error]
    D --> B
    C -- Yes --> E[Run local rule-based analyzer]
    E --> F[Extract findings and evidence]
    F --> G[Calculate risk score]
    G --> H{Gemini configured?}
    H -- No --> I[Use local results only]
    H -- Yes --> J[Send structured findings to Gemini]
    J --> K{AI request successful?}
    K -- Yes --> L[Parse AI explanation]
    K -- No --> I
    L --> M[Render report]
    I --> M
    M --> N[Review findings]
    N --> O[Export JSON]
    O --> P([End])
```

## Architecture

``` mermaid
flowchart TB
    subgraph UI["Presentation Layer"]
        A[HTML Dashboard]
        B[CSS Theme]
        C[Browser JavaScript]
    end

    subgraph Backend["Node.js Backend"]
        D[HTTP Server]
        E[Input Validation]
        F[Local Log Analyzer]
        G[Risk Scoring Engine]
        H[Gemini Integration]
        I[Report Builder]
    end

    J[Google Gemini API]
    K[(Local .env Configuration)]

    A --> C
    B --> A
    C --> D
    D --> E
    E --> F
    F --> G
    G --> I
    F --> H
    H --> K
    H --> J
    J --> H
    H --> I
    I --> D
    D --> C
```

### Component responsibilities

  -----------------------------------------------------------------------
  Component                           Responsibility
  ----------------------------------- -----------------------------------
  `public/index.html`                 Dashboard structure

  `public/style.css`                  Layout, theme, and responsive
                                      styling

  `public/app.js`                     Interactions, API calls, rendering,
                                      and export

  `src/server.js`                     HTTP server, validation, and Gemini
                                      requests

  `src/analyzer.js`                   Pattern detection, findings,
                                      recommendations, and risk scoring

  `test/analyzer.test.js`             Automated analyzer tests

  `samples/deployment.log`            Example log for demonstration

  `.env`                              Local Gemini configuration; do not
                                      commit

  `.agentia_quality_gates.cmd`        Windows quality-gate entry point

  `.agentia_quality_gates.sh`         Shell quality-gate entry point
  -----------------------------------------------------------------------

## Risk Scoring

The local analyzer uses a heuristic score based on detected finding
severity.

Let `H` be the number of high-severity findings and `M` the number of
medium-severity findings.

**Formula:**

`Risk = min(100, 40 × H + 15 × M)`

      Score Level
  --------- ---------
    70--100 HIGH
     30--69 MEDIUM
      1--29 LOW
          0 MINIMAL

### Example using the included sample

  Finding                  Severity           Points
  ------------------------ ---------- --------------
  Missing component        High                   40
  Automated test failure   High                   40
  Operation timed out      Medium                 15
  **Total**                             **95 / 100**

This is a heuristic indicator, not a calibrated probability of
deployment failure or an automated release approval.

## Technology Stack

  Technology            Purpose
  --------------------- ---------------------------------------------
  HTML5                 Dashboard structure
  CSS3                  Styling and responsive layout
  JavaScript            Frontend interactions
  Node.js               Server runtime
  Node.js HTTP module   Web server and API
  Fetch API             Server-side Gemini requests
  Google Gemini API     AI-assisted explanations
  Node.js test runner   Automated tests
  Git and GitHub        Version control
  Copado Agentia CLI    Hackathon tooling and quality-gate workflow

## Project Structure

``` text
Hackverse/
├── .agents/
│   └── skills/
├── .gitignore
├── AGENTS.md
├── .agentia_quality_gates.cmd
├── .agentia_quality_gates.sh
├── package.json
├── package-lock.json
├── public/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── reports/
│   └── diagnostic.json
├── samples/
│   └── deployment.log
├── src/
│   ├── analyzer.js
│   └── server.js
└── test/
    └── analyzer.test.js
```

The local `.env` file is intentionally not shown in the tracked project
structure because it should not be committed.

## Getting Started

### Prerequisites

-   Node.js compatible with the environment-file option used by the
    start script.
-   npm.
-   A Gemini API key for AI explanations. Local rule-based analysis can
    run without AI.

### 1. Get the repository

Replace the placeholders with your actual repository URL and folder
name:

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

If you already have the project locally, open its existing folder
instead.

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure Gemini

Create a `.env` file in the project root:

``` dotenv
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

Replace the placeholder with your own key. The model name is
configurable; use a model currently available to your Google AI account.

Optionally, create `.env.example` for other developers using
placeholders only:

``` dotenv
GEMINI_API_KEY=replace_with_your_own_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

Never place a real API key in source code, screenshots, documentation,
or Git commits.

### 4. Start the server

``` bash
npm start
```

Open the URL printed in the terminal. By default, the dashboard is
available at:

`http://127.0.0.1:3000`

### 5. Try the sample

1.  Click **Load sample**.
2.  Click **Analyze deployment log**.
3.  Review the risk score and findings.
4.  Inspect the AI Root Cause Analysis section.
5.  Export the JSON report if needed.

The included sample is expected to produce three findings and a score of
95.

## Using the Dashboard

### Input options

-   **Upload a file:** select a `.log` or `.txt` file within the 1 MB
    limit.
-   **Paste text:** place log content in the input area.
-   **Load sample:** use the included example without needing a real
    deployment log.

### Understanding the report

  -----------------------------------------------------------------------
  Section                             Meaning
  ----------------------------------- -----------------------------------
  Deployment Risk Score               Heuristic score from local rules

  Total Findings                      Number of recognized patterns

  High Severity                       Count of high-severity findings

  Medium Severity                     Count of medium-severity findings

  Detected Issues                     Rule ID, line, evidence, and
                                      recommendation

  AI Root Cause Analysis              Likely causes, actions, and caveats
                                      from Gemini when available

  Export JSON                         Downloads the diagnostic report
  -----------------------------------------------------------------------

AI-generated causes are hypotheses to verify, not confirmed diagnoses.

## API Documentation

### `POST /api/analyze`

Analyzes the supplied log content and returns the local findings, risk
assessment, and AI-analysis result or status.

**Request headers**

``` http
POST /api/analyze
Content-Type: application/json
```

**Request body**

``` json
{
  "content": "[ERROR] Test failed: AccountServiceTest"
}
```

**Illustrative response shape**

``` json
{
  "tool": "local-log-analysis",
  "mode": "local-log-analysis",
  "riskAssessment": {
    "score": 40,
    "level": "HIGH"
  },
  "summary": {
    "findings": 1,
    "high": 1,
    "medium": 0
  },
  "findings": [],
  "aiAnalysis": {
    "status": "available",
    "model": "gemini-3.1-flash-lite",
    "summary": "Example AI explanation",
    "likelyRootCauses": [],
    "recommendedActions": [],
    "caveats": []
  }
}
```

This is an illustrative response shape, not a guaranteed exact response
for every log. Actual field names and values depend on the
implementation and input. When Gemini is unavailable, the server should
preserve local results and indicate AI unavailability.

### HTTP status codes

  Status                        Meaning
  ----------------------------- -------------------------------------
  `200 OK`                      Analysis returned
  `400 Bad Request`             Invalid JSON or input
  `404 Not Found`               Unknown route
  `413 Payload Too Large`       Request exceeds the 1 MB limit
  `500 Internal Server Error`   Dashboard asset could not be served

## Testing

Run the automated tests:

``` bash
npm test
```

The current analyzer tests cover:

  Test                                   Purpose
  -------------------------------------- ----------------------------------
  Test failures and missing components   Verify known error detection
  Clean log                              Verify no known-pattern findings
  Line numbers                           Verify finding locations
  Invalid input type                     Reject non-string analyzer input

Run the sample analyzer:

``` bash
npm run analyze:sample
```

On Windows, run the configured Agentia quality-gate script:

``` powershell
.\.agentia_quality_gates.cmd
```

### Manual verification checklist

-   [ ] Dashboard loads at `http://127.0.0.1:3000`.
-   [ ] Sample log loads and analyzes.
-   [ ] Sample produces three findings and a score of 95.
-   [ ] Gemini analysis appears when the API is available.
-   [ ] Local analysis remains available if Gemini fails.
-   [ ] A clean log produces no known-pattern findings.
-   [ ] Empty input is handled appropriately.
-   [ ] JSON export works.
-   [ ] The API key is not exposed in frontend code.
-   [ ] `.env` is excluded from Git.

## Security and Privacy

-   **API key protection:** the Gemini key is configured on the server
    through an environment variable.
-   **Input limit:** request bodies are limited to 1 MB.
-   **Server-side AI requests:** the browser should not call Gemini
    directly with the secret key.
-   **External processing:** structured diagnostic findings are sent to
    Google Gemini when AI analysis is enabled.
-   **Sensitive logs:** do not submit confidential, personal, or
    production-sensitive data unless permitted by your organization's
    policies.
-   **No live deployment access:** this prototype does not retrieve
    actual Copado or Salesforce deployment status.
-   **Quotas and costs:** API availability, limits, and charges depend
    on your Google AI account, model, and applicable terms.

Review the implementation and your organization's data-handling policies
before using this with production data.

## Limitations

1.  Local detection is limited to implemented pattern rules.
2.  The risk score is heuristic, not a statistically validated failure
    probability.
3.  Gemini may produce incomplete or incorrect explanations; verify
    recommendations.
4.  Live Copado and Salesforce integration is not implemented.
5.  The tool does not automatically apply fixes or redeploy software.
6.  The server binds to `127.0.0.1` by default.
7.  Authentication, multi-user access, and persistent report history are
    outside the current prototype scope.

## Roadmap

  -----------------------------------------------------------------------
  Priority                Planned improvement     Benefit
  ----------------------- ----------------------- -----------------------
  High                    Add more diagnostic     Recognize more failure
                          rules and tests         patterns

  High                    Improve input           Improve reliability
                          validation and error    
                          messages                

  High                    Implement authorized    Analyze real deployment
                          Copado API integration  data

  Medium                  Add report history and  Track recurring issues
                          comparison              

  Medium                  Add filtering and       Navigate larger reports
                          search                  

  Medium                  Add PDF export          Share reports more
                                                  easily

  Future                  Add authenticated team  Support collaborative
                          access                  workflows

  Future                  Add safeguarded         Help developers act on
                          remediation workflows   verified findings
  -----------------------------------------------------------------------

These are proposed improvements, not current capabilities.

## Contributing

Contributions to diagnostic accuracy, tests, usability, documentation,
and security are welcome.

1.  Fork the repository.
2.  Create a feature branch.
3.  Implement your change.
4.  Add or update tests.
5.  Run `npm test`.
6.  Open a pull request with a clear description.

New diagnostic rules should include test cases and document their
severity and recommended investigation.

## License

A license has not yet been specified. Add a `LICENSE` file that reflects
your intended reuse terms and any applicable hackathon requirements
before inviting external reuse.

## Acknowledgements

-   Google Gemini API for AI-assisted explanations.
-   Copado Agentia tooling for the hackathon development workflow.
-   The open-source developer community.

------------------------------------------------------------------------

**ReleasePilot AI --- Turn deployment logs into actionable insights.**
