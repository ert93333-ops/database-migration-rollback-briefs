const PRODUCT = "Database Migration Rollback Briefs";
const STORAGE_PREFIX = "databasemigrationrollbackbriefs";
const ISSUE_URL = "https://github.com/ert93333-ops/database-migration-rollback-briefs/issues/new?template=demo_request.md&labels=early-access%2Cpurchase-intent%2Cdemo-request&title=Early%20access%20request%3A%20Database%20Migration%20Rollback%20Briefs";

const fields = {
  notes: document.querySelector("#migration-notes"),
  scope: document.querySelector("#scope-notes"),
  backup: document.querySelector("#backup-notes"),
  compatibility: document.querySelector("#compatibility-notes"),
  runtime: document.querySelector("#runtime-notes"),
  rollback: document.querySelector("#rollback-notes"),
  drift: document.querySelector("#drift-notes"),
  validation: document.querySelector("#validation-notes"),
  owner: document.querySelector("#owner-notes"),
  privacy: document.querySelector("#privacy-notes"),
};

const output = document.querySelector("#brief-output");
const outputStatus = document.querySelector("#output-status");
const workflowError = document.querySelector("#workflow-error");
const copyButton = document.querySelector("#copy-brief");
const copyStatus = document.querySelector("#copy-status");
const intentForm = document.querySelector("#intent-form");
const intentStatus = document.querySelector("#intent-status");
const remoteIntent = document.querySelector("#remote-intent");
const remoteIntentLink = document.querySelector("#remote-intent-link");
const remoteCopyButton = document.querySelector("#copy-remote-intent");
const remoteCopyStatus = document.querySelector("#remote-copy-status");

let lastBriefText = "";
let selectedPlan = "Starter";
let lastRemoteBody = "";

function track(event, detail = {}) {
  const payload = {
    event,
    detail,
    page: window.location.pathname,
    utm: Object.fromEntries(new URLSearchParams(window.location.search)),
    at: new Date().toISOString(),
  };
  const key = `${STORAGE_PREFIX}_analytics_events`;
  const events = JSON.parse(localStorage.getItem(key) || "[]");
  events.push(payload);
  localStorage.setItem(key, JSON.stringify(events.slice(-200)));
}

function hasAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function fieldText() {
  return Object.fromEntries(Object.entries(fields).map(([key, element]) => [key, element.value.trim()]));
}

function combinedText(values) {
  return Object.values(values).join("\n").toLowerCase();
}

function missingChecks(values) {
  const all = combinedText(values);
  const scopeText = `${values.notes} ${values.scope}`.toLowerCase();
  const backupText = `${values.notes} ${values.backup}`.toLowerCase();
  const compatibilityText = `${values.notes} ${values.compatibility}`.toLowerCase();
  const runtimeText = `${values.notes} ${values.runtime}`.toLowerCase();
  const rollbackText = `${values.notes} ${values.rollback}`.toLowerCase();
  const driftText = `${values.notes} ${values.drift}`.toLowerCase();
  const validationText = `${values.notes} ${values.validation}`.toLowerCase();

  const checks = [
    {
      label: "missing framework, command, migration ID, environment, table, column, index, or data/backfill scope:",
      ok: hasAny(scopeText, [/\bprisma\b/, /\brails\b/, /\bdjango\b/, /\bflyway\b/, /\bliquibase\b/, /\bmigrate\b/, /\bmigration\b/, /\bversion\b/, /\bid\b/, /\bproduction\b/, /\bstaging\b/, /\btable\b/, /\bcolumn\b/, /\bindex\b/, /\bbackfill\b/, /\bschema\b/]),
    },
    {
      label: "missing production, staging, snapshot, backup, restore, or pre-migration recovery context:",
      ok: hasAny(backupText, [/\bproduction\b/, /\bstaging\b/, /\bsnapshot\b/, /\bbackup\b/, /\brestore\b/, /\bpoint[- ]in[- ]time\b/, /\bpitr\b/, /\bdump\b/, /\brecovery\b/, /\bpre[- ]migration\b/]),
    },
    {
      label: "missing expand-contract, backward compatibility, dual-write, nullable/default, app-version, or backfill context:",
      ok: hasAny(compatibilityText, [/\bexpand\b/, /\bcontract\b/, /\bbackward compatible\b/, /\bcompatible\b/, /\bdual[- ]write\b/, /\bnullable\b/, /\bdefault\b/, /\bapp version\b/, /\bapplication version\b/, /\bbackfill\b/, /\bdeprecate\b/, /\bread old\b/, /\bread new\b/]),
    },
    {
      label: "missing lock, long-running query, transaction, DDL, concurrent index, downtime, or maintenance-window context:",
      ok: hasAny(runtimeText, [/\block\b/, /\blong[- ]running\b/, /\btransaction\b/, /\bddl\b/, /\bconcurrent(ly)?\b/, /\bcreate index\b/, /\bmaintenance window\b/, /\bdowntime\b/, /\btimeout\b/, /\bonline\b/, /\bblocking\b/]),
    },
    {
      label: "missing rollback, reverse, down migration, previous version, revert, restore, or failed-migration resolution plan:",
      ok: hasAny(rollbackText, [/\brollback\b/, /\breverse\b/, /\bdown migration\b/, /\bdown\b/, /\bprevious version\b/, /\brevert\b/, /\brestore\b/, /\bfailed migration\b/, /\bmigrate resolve\b/, /\bdb:rollback\b/, /\bmigrate .* 000?\d*\b/, /\bundo\b/]),
    },
    {
      label: "missing drift, manual hotfix, schema history, migration table, or edited/deleted migration context:",
      ok: hasAny(driftText, [/\bdrift\b/, /\bmanual\b/, /\bhotfix\b/, /\bschema history\b/, /\bmigration history\b/, /\bschema_migrations\b/, /\b_prisma_migrations\b/, /\bedited migration\b/, /\bdeleted migration\b/, /\bmodified migration\b/, /\bresolved\b/]),
    },
    {
      label: "missing validation, smoke test, query check, migration status, metrics, monitoring, or error-rate path:",
      ok: hasAny(validationText, [/\bvalidate\b/, /\bvalidation\b/, /\bsmoke test\b/, /\bquery check\b/, /\bmigrate status\b/, /\bstatus\b/, /\bmetrics\b/, /\bmonitor\b/, /\berror rate\b/, /\balert\b/, /\bhealth check\b/, /\bcount\b/]),
    },
    {
      label: "missing owner, reviewer, approver, escalation, maintenance window, or next update:",
      ok: hasAny(`${values.notes} ${values.owner}`.toLowerCase(), [/\bowner\b/, /\breviewer\b/, /\bapprover\b/, /\bapproval\b/, /\bescalat(e|ion)\b/, /\bmaintenance window\b/, /\bchange window\b/, /\bnext update\b/, /\bby \d{1,2}:\d{2}\b/, /\butc\b/, /\brelease lead\b/]),
    },
  ];

  const unsafeWording = hasAny(all, [/\breset production\b/, /\bdrop database\b/, /\bdrop table\b/, /\btruncate\b/, /\brecreate database\b/, /\bforce apply\b/, /\bjust apply\b/, /\bno backup\b/, /\bbackup not needed\b/, /\brollback impossible\b/, /\bno downtime guaranteed\b/, /\bguaranteed no downtime\b/]);
  const privateRisk = hasAny(all, [/\bdatabase_url\b/, /\bpostgres:\/\/\b/, /\bmysql:\/\/\b/, /\bconnection string\b/, /\bdb password\b/, /\bpassword\b/, /\bsecret\b/, /\bdump file\b/, /\bproduction dump\b/, /\bcustomer row\b/, /\buser email\b/, /\bpersonal email\b/, /\baccount id\b/, /\braw log\b/, /\bpii\b/, /\bssn\b/, /\bcredit card\b/]);

  const warnings = checks.filter((check) => !check.ok).map((check) => check.label);
  if (unsafeWording) warnings.push("unsafe reset, drop, recreate, force-apply, no-backup, impossible-rollback, or unsupported no-downtime wording:");
  if (privateRisk) warnings.push("private database URL, credentials, connection string, dump, customer row data, PII, raw log, account ID, or production data risk:");
  return warnings;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function line(label, value, fallback) {
  return `<li><strong>${label}:</strong> ${escapeHtml(value || fallback)}</li>`;
}

function buildBrief(values) {
  const warnings = missingChecks(values);
  const outline = [
    "Name framework, command, migration ID/version, environment, table/column/index scope, and data/backfill scope.",
    "State snapshot/backup/restore status before migration and who can execute recovery.",
    "Call out expand-contract compatibility, nullable/default behavior, backfill, and app-version rollout order.",
    "Write lock, DDL, transaction, concurrent-index, downtime, and maintenance-window risk in plain language.",
    "List rollback/down/reverse/restore plan, drift/manual hotfix status, validation checks, owner, reviewer, and next update.",
  ];

  output.innerHTML = `
    <h3>Database migration rollback brief ready</h3>
    <h4>Parse summary</h4>
    <ul>
      ${line("Migration scope", values.scope, "Needs framework, command, migration ID, environment, table, column, index, and data scope.")}
      ${line("Backup and restore", values.backup, "Needs production/staging, snapshot, backup, restore, or recovery context.")}
      ${line("Compatibility", values.compatibility, "Needs expand-contract, app compatibility, nullable/default, dual-write, or backfill context.")}
      ${line("Runtime risk", values.runtime, "Needs lock, transaction, DDL, concurrent index, downtime, or maintenance-window context.")}
      ${line("Rollback plan", values.rollback, "Needs rollback, reverse/down migration, previous version, restore, or failed-migration resolution path.")}
    </ul>
    <h4>Missing context and risk warnings</h4>
    ${warnings.length ? `<ul>${warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>` : "<p>No major missing context detected in the public-safe fields.</p>"}
    <h4>Reviewer-ready migration outline</h4>
    <ol>${outline.map((item) => `<li>${item}</li>`).join("")}</ol>
    <h4>Validation and rollback handoff</h4>
    <p>${escapeHtml(values.validation || "Add migration status, smoke test, query checks, metrics, alerts, and error-rate monitoring.")}</p>
    <p>${escapeHtml(values.rollback || "Add rollback/down migration, restore plan, previous version, approval owner, and rollback validation path.")}</p>
    <h4>Owner and approval path</h4>
    <p>${escapeHtml(values.owner || "Set a named backend/platform owner, reviewer, approver, escalation path, and next-update time.")}</p>
  `;

  lastBriefText = output.innerText;
  outputStatus.textContent = warnings.length ? `${warnings.length} issue(s) to review` : "Brief ready";
  copyButton.disabled = false;
  track("brief_generated", { warningCount: warnings.length });
  track("core_action_completed", { warningCount: warnings.length });
}

function generateBrief() {
  workflowError.textContent = "";
  const values = fieldText();
  if (!values.notes) {
    workflowError.textContent = "Paste public-safe database migration notes first.";
    track("brief_generation_failed", { reason: "empty_migration_notes" });
    return;
  }
  track("core_action_started", { triggerSource: "generate_button" });
  buildBrief(values);
}

async function copyText(text, statusElement, success) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  statusElement.textContent = success;
}

function loadSample() {
  fields.notes.value = "Deploy Prisma migration 202606051020_add_billing_status to production after app v4.8 is live.";
  fields.scope.value = "Framework Prisma; command prisma migrate deploy; production environment; table invoices; nullable billing_status column with default pending; backfill 120k rows.";
  fields.backup.value = "Snapshot completed at 10:00 UTC; restore owner is database on-call; staging migration passed against latest sanitized schema.";
  fields.compatibility.value = "Expand-contract rollout: add nullable column first, app v4.8 writes both old and new paths, backfill runs in batches, contract cleanup later.";
  fields.runtime.value = "DDL reviewed for lock risk; backfill batches 5k rows; no long transaction; maintenance window 10:00-10:30 UTC; error budget monitor active.";
  fields.rollback.value = "Rollback plan: stop backfill, revert app to v4.7, restore snapshot if data corruption appears, mark failed migration with migrate resolve only after DBA approval.";
  fields.drift.value = "No manual hotfix drift; _prisma_migrations matches git migration history; no edited or deleted migration files.";
  fields.validation.value = "Run prisma migrate status, invoice create/read smoke test, row count query, error-rate dashboard, DB lock monitor, and latency alerts.";
  fields.owner.value = "Backend release lead owns; DBA reviewer approves; next update by 10:15 UTC.";
  fields.privacy.value = "Public-safe notes only; no DATABASE_URL, credentials, dumps, customer rows, raw logs, or personal data.";
  track("sample_loaded", { sample: "billing_status_migration" });
}

const pathName = window.location.pathname;
track("page_view");
if (pathName === "/" || pathName.endsWith("/") || pathName.endsWith("/index.html")) track("landing_viewed");
if (pathName.endsWith("database-migration-rollback-checklist.html")) {
  track("template_opened");
  track("seo_page_viewed");
}

if (document.querySelector("#generate-button")) {
  document.querySelector("#generate-button").addEventListener("click", generateBrief);
  document.querySelector("#sample-button").addEventListener("click", loadSample);
  copyButton.addEventListener("click", () => {
    copyText(lastBriefText, copyStatus, "Copied migration rollback brief.");
    track("copy_brief_clicked");
  });

  document.querySelectorAll(".plan-button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedPlan = button.dataset.plan;
      document.querySelector("#plan-interest").value = selectedPlan;
      track("plan_selected", { plan: selectedPlan });
      track("pricing_viewed", { plan: selectedPlan });
      intentForm.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  intentForm.addEventListener("submit", (event) => {
    event.preventDefault();
    track("signup_started", { plan: selectedPlan });
    const intent = {
      email: document.querySelector("#intent-email").value.trim(),
      role: document.querySelector("#intent-role").value.trim(),
      volume: document.querySelector("#migration-volume").value.trim(),
      process: document.querySelector("#current-process").value.trim(),
      plan: document.querySelector("#plan-interest").value,
      willingness: document.querySelector("#willingness").value.trim(),
      at: new Date().toISOString(),
    };
    const key = `${STORAGE_PREFIX}_purchase_intents`;
    const intents = JSON.parse(localStorage.getItem(key) || "[]");
    intents.push(intent);
    localStorage.setItem(key, JSON.stringify(intents.slice(-50)));
    lastRemoteBody = [
      "Public early access request for Database Migration Rollback Briefs.",
      "",
      `Role/team: ${intent.role || "[not provided]"}`,
      `Migration review volume: ${intent.volume || "[not provided]"}`,
      `Current migration review process: ${intent.process || "[not provided]"}`,
      `Plan interest: ${intent.plan}`,
      `Willingness to pay: ${intent.willingness || "[not provided]"}`,
      "",
      "Do not include database URLs, credentials, connection strings, dumps, customer rows, raw logs, account IDs, PII, or email addresses in this public issue.",
    ].join("\n");
    remoteIntentLink.href = `${ISSUE_URL}&body=${encodeURIComponent(lastRemoteBody)}`;
    remoteIntent.hidden = false;
    intentStatus.textContent = "You are on the early access list. Open or copy the public request if you want remote follow-up.";
    track("purchase_intent_submitted", { plan: intent.plan, hasEmail: Boolean(intent.email) });
    track("waitlist_submitted", { plan: intent.plan });
    track("signup_completed", { plan: intent.plan });
    track("remote_intent_ready", { includesEmail: false });
  });

  remoteCopyButton.addEventListener("click", () => {
    copyText(lastRemoteBody, remoteCopyStatus, "Copied request details.");
    track("remote_intent_copied");
  });

  document.querySelectorAll('a[href="#workflow"]').forEach((link) => {
    link.addEventListener("click", () => track("cta_clicked", { triggerSource: "workflow_anchor" }));
  });
}
