const logInput = document.querySelector("#logInput");
const logFile = document.querySelector("#logFile");
const fileName = document.querySelector("#fileName");
const analyzeBtn = document.querySelector("#analyzeBtn");
const sampleBtn = document.querySelector("#sampleBtn");
const message = document.querySelector("#message");
const emptyState = document.querySelector("#emptyState");
const results = document.querySelector("#results");
const resultState = document.querySelector("#resultState");
const findingsList = document.querySelector("#findingsList");
const exportBtn = document.querySelector("#exportBtn");

let latestReport = null;

const sampleLog = [
  "[INFO] Starting release validation",
  "[INFO] Checking metadata components",
  "[ERROR] Component not found: AccountSummary",
  "[ERROR] Test failed: AccountServiceTest",
  "[WARN] Deployment timed out after 120 seconds",
  "[INFO] Diagnostic sample completed"
].join("\n");

sampleBtn.addEventListener("click", () => {
  logInput.value = sampleLog;
  fileName.textContent = "Sample deployment log loaded";
  message.textContent = "";
});

logFile.addEventListener("change", async () => {
  const file = logFile.files?.[0];
  if (!file) return;

  if (file.size > 1024 * 1024) {
    message.textContent = "Please select a file smaller than 1 MB.";
    logFile.value = "";
    return;
  }

  try {
    logInput.value = await file.text();
    fileName.textContent = `Loaded: ${file.name}`;
    message.textContent = "";
  } catch {
    message.textContent = "Unable to read this file.";
  }
});

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = String(text ?? "");
  parent.appendChild(element);
  return element;
}

function renderAiAnalysis(ai) {
  const status = document.querySelector("#aiStatus");
  const summary = document.querySelector("#aiSummary");
  const details = document.querySelector("#aiDetails");

  details.replaceChildren();

  if (!ai || ai.status !== "available") {
    status.textContent = "LOCAL FALLBACK";
    status.className = "step-tag ai-status-warning";
    summary.textContent =
      ai?.message || "AI analysis is unavailable. Local findings are still shown.";
    return;
  }

  status.textContent = "GEMINI ACTIVE";
  status.className = "step-tag ai-status-ok";
  summary.textContent = ai.summary || "No AI summary was returned.";

  const sections = [
    ["Likely root causes", ai.likelyRootCauses],
    ["Recommended actions", ai.recommendedActions],
    ["Caveats and verification", ai.caveats]
  ];

  for (const [heading, items] of sections) {
    if (!Array.isArray(items) || items.length === 0) continue;

    const section = document.createElement("section");
    section.className = "ai-section";
    addText(section, "h4", "", heading);

    const list = document.createElement("ul");

    for (const item of items) {
      addText(list, "li", "", item);
    }

    section.appendChild(list);
    details.appendChild(section);
  }
}

function renderReport(report) {
  latestReport = report;
  emptyState.hidden = true;
  results.hidden = false;
  resultState.textContent = "ANALYSIS COMPLETE";

  document.querySelector("#riskScore").textContent =
    report.riskAssessment.score;
  document.querySelector("#ringScore").textContent =
    report.riskAssessment.score;
  document.querySelector("#riskLevel").textContent =
    report.riskAssessment.level;
  document.querySelector("#totalFindings").textContent =
    report.summary.findings;
  document.querySelector("#highCount").textContent =
    report.summary.high;
  document.querySelector("#mediumCount").textContent =
    report.summary.medium;
  document.querySelector("#lineCount").textContent =
    `${report.summary.linesAnalyzed} lines analyzed`;

  const score = report.riskAssessment.score;
  const ring = document.querySelector("#riskRing");
  const ringColor =
    score >= 70 ? "#ff767f" :
    score >= 30 ? "#ffcf83" :
    score > 0 ? "#71b9ff" : "#53d6a0";

  ring.style.background =
    `conic-gradient(${ringColor} ${score * 3.6}deg, #28344e 0deg)`;

  findingsList.replaceChildren();

  if (report.findings.length === 0) {
    addText(
      findingsList,
      "p",
      "muted",
      "No known error patterns were detected in this log."
    );
  }

  for (const finding of report.findings) {
    const card = document.createElement("article");
    card.className = "finding";

    const top = document.createElement("div");
    top.className = "finding-top";

    addText(top, "h4", "", finding.title);
    addText(
      top,
      "span",
      `severity ${finding.severity}`,
      finding.severity.toUpperCase()
    );

    card.appendChild(top);

    addText(
      card,
      "p",
      "muted small",
      `${finding.ruleId} · Line ${finding.line}`
    );
    addText(card, "p", "evidence", finding.evidence);
    addText(
      card,
      "p",
      "recommendation",
      `Recommended action: ${finding.recommendation}`
    );

    findingsList.appendChild(card);
  }

  document.querySelector("#disclaimer").textContent =
    `${report.disclaimer} ${report.riskAssessment.explanation}`;

  renderAiAnalysis(report.aiAnalysis);
}

analyzeBtn.addEventListener("click", async () => {
  const content = logInput.value;

  if (!content.trim()) {
    message.textContent = "Upload a log or paste its content first.";
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  message.textContent = "Running local checks and requesting AI analysis...";
  message.style.color = "#92a0bb";

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed.");
    }

    renderReport(data);

    if (data.aiAnalysis?.status === "available") {
      message.textContent = "Local checks and Gemini AI analysis completed.";
      message.style.color = "#53d6a0";
    } else {
      message.textContent =
        "Local analysis completed. Gemini is unavailable; see the AI panel.";
      message.style.color = "#ffcf83";
    }
  } catch (error) {
    message.textContent =
      `${error.message} Check that the local server is running.`;
    message.style.color = "#ff999f";
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze deployment log →";
  }
});

exportBtn.addEventListener("click", () => {
  if (!latestReport) return;

  const blob = new Blob(
    [JSON.stringify(latestReport, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "releasepilot-diagnostic-report.json";
  link.click();
  URL.revokeObjectURL(url);
});