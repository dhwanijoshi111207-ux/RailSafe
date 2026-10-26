
/* =========================================================
   RAILSAFE - MAIN JAVASCRIPT
   Issues, Dashboard, Maintenance, Evidence and Photo Compare
   ========================================================= */

const API_BASE = "https://railsafe-2.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    setupRegisterForm();
    setupLoginForm();
    setupReportForm();
    setupTrackForm();
    setupPhotoNames();
    loadDashboardIssues();
    loadDashboardStats();
    loadIssueDetails();
    setupIssueDetailsStatus();
    setupMaintenanceForm();
    setupEvidenceForm();
});

/* ================= COMMON HELPERS ================= */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value == null || value === "" ? "-" : value;
}

function showMessage(el, message, success = false) {
    if (!el) return;
    el.textContent = message;
    el.style.color = success ? "#177245" : "#b42318";
}

function normalizeReportId(value) {
    const id = String(value || "").trim().replace(/^RR-/i, "");
    return /^\d+$/.test(id) ? id : "";
}

function currentReportId() {
    return normalizeReportId(
        new URLSearchParams(window.location.search).get("id")
    );
}

/* ================= REGISTER ================= */

function setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = document.getElementById("registerName");
        const email = document.getElementById("registerEmail");
        const password = document.getElementById("registerPassword");
        const message = document.getElementById("registerMessage");

        if (!name || !email || !password) return;

        if (!name.value.trim() || !email.value.trim() || !password.value) {
            showMessage(message, "Please fill all required fields.");
        } else if (password.value.length < 6) {
            showMessage(message, "Password must contain at least 6 characters.");
        } else {
            showMessage(message, "Registration form validated successfully.", true);
        }
    });
}

/* ================= LOGIN ================= */

function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const email = document.getElementById("loginEmail");
        const password = document.getElementById("loginPassword");
        const message = document.getElementById("loginMessage");

        if (!email || !password) return;

        if (!email.value.trim() || !password.value.trim()) {
            showMessage(message, "Please enter your email and password.");
        } else {
            showMessage(message, "Login form validated successfully.", true);
        }
    });
}

/* ================= REPORT ISSUE ================= */

function setupReportForm() {
    const form = document.getElementById("reportForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const station = document.getElementById("station");
        const platform = document.getElementById("platform");
        const infrastructure = document.getElementById("infrastructure");
        const description = document.getElementById("description");
        const message = document.getElementById("reportMessage");

        if (!station || !platform || !infrastructure || !description) return;

        if (![station, platform, infrastructure, description]
            .every(field => field.value.trim())) {
            showMessage(message, "Please complete all required issue details.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    station: station.value.trim(),
                    platform: platform.value.trim(),
                    issueType: infrastructure.value.trim(),
                    description: description.value.trim(),
                    priority: "Medium",
                    status: "Reported"
                })
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const issue = await response.json();
            showMessage(
                message,
                `Issue reported successfully. Report ID: RR-${issue.reportId}`,
                true
            );
            form.reset();
        } catch (error) {
            console.error("Report error:", error);
            showMessage(message, "Unable to submit issue. Please try again.");
        }
    });
}

/* ================= TRACK ISSUE ================= */

function setupTrackForm() {
    const form = document.getElementById("trackForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const input = document.getElementById("reportId");
        const result = document.getElementById("trackResult");
        if (!input || !result) return;

        const reportId = normalizeReportId(input.value);

        if (!reportId) {
            alert("Please enter a valid Report ID, for example RR-1.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/issues/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const issue = await response.json();

            if (!issue || !issue.reportId) {
                throw new Error("Issue not found");
            }

            result.hidden = false;
            setText("trackReportId", `RR-${issue.reportId}`);
            setText("trackStation", issue.station);
            setText("trackPlatform", `Platform ${issue.platform}`);
            setText("trackInfrastructure", issue.issueType);
            setText("trackIssueHeading", issue.issueType);
            setText("trackDescription", issue.description || issue.issueType);
            setText("trackLocation", `${issue.station} — Platform ${issue.platform}`);
            setText("trackIssueDetected", issue.issueType);
            setText("trackStatus", issue.status || "Reported");
            updateTimeline(issue.status || "Reported");
        } catch (error) {
            result.hidden = true;
            console.error("Track error:", error);
            alert("Unable to find this Report ID. Check the ID and try again.");
        }
    });
}

function normalizeReportId(value) {
    const cleaned = String(value || "")
        .trim()
        .replace(/^RR-/i, "");

    if (!/^\d+$/.test(cleaned)) return "";
    return cleaned;
}

/* =========================================================
   SET TEXT
   ========================================================= */

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value == null || value === "" ? "-" : value;
    }
}

/* ================= TIMELINE ================= */

function updateTimeline(status) {
    const ids = [
        "timelineReported",
        "timelineAssigned",
        "timelineMaintenance",
        "timelineResolved",
        "timelineClosed"
    ];

    const stages = [
        ["Reported"],
        ["Assigned", "Inspection"],
        ["Under Maintenance"],
        ["Resolved"],
        ["Closed"]
    ];

    let active = stages.findIndex(stage => stage.includes(status));
    if (active < 0) active = 0;

    ids.forEach((id, index) => {
        const el = document.getElementById(id);
        if (!el) return;

        element.classList.remove("completed", "active");

        if (index < activeIndex) {
            element.classList.add("completed");
        } else if (index === activeIndex) {
            element.classList.add("active", "completed");
        }
    });
}

/* =========================================================
   PHOTO FILE NAME DISPLAY
   ========================================================= */

function setupPhotoNames() {
    [
        ["beforeCamera", "beforePhotoName"],
        ["beforeGallery", "beforePhotoName"],
        ["afterCamera", "afterPhotoName"],
        ["afterGallery", "afterPhotoName"],
        ["issuePhotoCamera", "photoName"],
        ["issuePhotoGallery", "photoName"]
    ].forEach(function (pair) {
        setupPhotoName(pair[0], pair[1]);
    });
}

function setupPhotoName(inputId, nameId) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(nameId);

    if (!input || !display) return;

    input.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
            display.textContent = this.files[0].name;
        } else {
            display.textContent = "";
        }
    });
}

/* ================= DASHBOARD ISSUES ================= */

async function loadDashboardIssues() {
    const table = document.querySelector(".issue-table tbody");
    if (!table) return;

    try {
        const response = await fetch(`${API_BASE}/api/issues`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const issues = await response.json();
        table.innerHTML = "";

        if (!Array.isArray(issues) || issues.length === 0) {
            table.innerHTML =
                '<tr><td colspan="6">No issues reported yet.</td></tr>';
            return;
        }

        issues.forEach(issue => {
            const row = document.createElement("tr");

            [
                `RR-${issue.reportId}`,
                `${issue.station || "-"} — Platform ${issue.platform || "-"}`,
                issue.issueType || "-",
                issue.priority || "Medium",
                issue.status || "Reported"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const action = document.createElement("td");
            const link = document.createElement("a");

            link.href = `issue-details.html?id=RR-${encodeURIComponent(issue.reportId)}`;
            link.className = "view-button";
            link.textContent = "View";

            actionCell.appendChild(link);
            row.appendChild(actionCell);
            table.appendChild(row);
        });
    } catch (error) {
        console.error("Dashboard issue loading error:", error);
    }
}

/* ================= DASHBOARD COUNTS ================= */

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/api/issues`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const issues = await response.json();
        if (!Array.isArray(issues)) return;

        const total = issues.length;

        const requiresAction = issues.filter(issue =>
            ["Reported", "Assigned", "Inspection"].includes(issue.status)
        ).length;

        const underMaintenance = issues.filter(
            issue => issue.status === "Under Maintenance"
        ).length;

        const resolved = issues.filter(
            issue => ["Resolved", "Closed"].includes(issue.status)
        ).length;

        const cards = document.querySelectorAll(".dashboard-cards .card h2");

        if (cards.length >= 4) {
            cards[0].textContent = total;
            cards[1].textContent = action;
            cards[2].textContent = maintenance;
            cards[3].textContent = resolved;
        }
    } catch (error) {
        console.error("Dashboard counts error:", error);
    }
}

/* =========================================================
   ISSUE DETAILS PAGE
   ========================================================= */

async function loadIssueDetails() {
    if (!document.getElementById("detailReportId")) return;

    const params = new URLSearchParams(window.location.search);
    const reportId = normalizeReportId(params.get("id"));

    if (!reportId) return;

    try {
        const response = await fetch(`${API_BASE}/api/issues/${id}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const issue = await response.json();

        if (!issue || issue.reportId == null) {
            throw new Error("Issue not found");
        }

        setText("detailReportId", `RR-${issue.reportId}`);
        setText("detailStation", issue.station);
        setText("detailPlatform", `Platform ${issue.platform}`);
        setText("detailIssueType", issue.issueType);
        setText("detailStatus", issue.status || "Reported");
        setText("detailReportedIssue", issue.description || issue.issueType);
        setText("detailLocation", `${issue.station} — Platform ${issue.platform}`);
        setText("detailReportStatus", issue.status || "Reported");
        setText("detailPriority", issue.priority || "Medium");

        const select = document.getElementById("issueStatus");
        if (select) select.value = issue.status || "Reported";
    } catch (error) {
        console.error("Issue details error:", error);
    }
}

/* ================= UPDATE ISSUE STATUS ================= */

function setupIssueDetailsStatus() {
    const button = document.getElementById("updateStatusButton");
    const select = document.getElementById("issueStatus");
    if (!button || !select) return;

    button.addEventListener("click", async function () {
        const params = new URLSearchParams(window.location.search);
        const reportId = normalizeReportId(params.get("id"));

        if (!reportId) {
            alert("No valid Report ID found.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/api/issues/${id}/status?status=${encodeURIComponent(requestedStatus)}`,
                { method: "PUT" }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const issue = await response.json();

            setText("detailStatus", issue.status);
            setText("detailReportStatus", issue.status);

            alert(`Issue status updated to: ${issue.status}`);

            loadDashboardStats();
        } catch (error) {
            console.error("Status update error:", error);
            alert("Unable to update issue status. Please try again.");
        }
    });
}
