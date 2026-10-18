
/* =========================================================
   RAILSAFE - MAIN JAVASCRIPT
   Issue reporting, tracking and maintenance management
   No photo comparison or CV testing
   ========================================================= */

const API_BASE = "https://railsafe-2.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
    console.log("RailSafe system loaded successfully.");

    setupRegisterForm();
    setupLoginForm();
    setupReportForm();
    setupTrackForm();
    setupPhotoNames();
    loadDashboardIssues();
    loadDashboardStats();
    loadIssueDetails();
    setupIssueDetailsStatus();
});

/* ========================= COMMON MESSAGE ========================= */

function showMessage(element, message, success) {
    if (!element) return;
    element.textContent = message;
    element.style.color = success ? "#177245" : "#b42318";
}

/* ========================= REGISTER ========================= */

function setupRegisterForm() {
    const form = document.getElementById("registerForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName");
        const email = document.getElementById("registerEmail");
        const password = document.getElementById("registerPassword");
        const message = document.getElementById("registerMessage");

        if (!name || !email || !password) return;

        if (!name.value.trim() || !email.value.trim() || !password.value) {
            showMessage(message, "Please fill all required fields.", false);
            return;
        }

        if (password.value.length < 6) {
            showMessage(message, "Password must contain at least 6 characters.", false);
            return;
        }

        showMessage(message, "Registration form validated successfully.", true);
    });
}

/* ========================= LOGIN ========================= */

function setupLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail");
        const password = document.getElementById("loginPassword");
        const message = document.getElementById("loginMessage");

        if (!email || !password) return;

        if (!email.value.trim() || !password.value.trim()) {
            showMessage(message, "Please enter your email and password.", false);
            return;
        }

        showMessage(message, "Login form validated successfully.", true);
    });
}

/* ========================= REPORT ISSUE ========================= */

function setupReportForm() {
    const form = document.getElementById("reportForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const station = document.getElementById("station");
        const platform = document.getElementById("platform");
        const infrastructure = document.getElementById("infrastructure");
        const description = document.getElementById("description");
        const message = document.getElementById("reportMessage");

        if (!station || !platform || !infrastructure || !description) return;

        if (
            !station.value.trim() ||
            !platform.value.trim() ||
            !infrastructure.value.trim() ||
            !description.value.trim()
        ) {
            showMessage(message, "Please complete all required issue details.", false);
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

            if (!response.ok) {
                throw new Error(`Issue submission failed (${response.status})`);
            }

            const issue = await response.json();

            showMessage(
                message,
                `Issue reported successfully. Report ID: RR-${issue.reportId}`,
                true
            );

            form.reset();
            console.log("Issue saved:", issue);
        } catch (error) {
            console.error("Report submission error:", error);
            showMessage(
                message,
                "Unable to submit issue. Please try again later.",
                false
            );
        }
    });
}

/* ========================= TRACK ISSUE ========================= */

function setupTrackForm() {
    const form = document.getElementById("trackForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
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
            const response = await fetch(
                `${API_BASE}/api/issues/${encodeURIComponent(reportId)}`
            );

            if (!response.ok) {
                throw new Error(`Issue lookup failed (${response.status})`);
            }

            const issue = await response.json();

            if (!issue || issue.reportId == null) {
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

            // Before/After evidence connection will be added after
            // confirming the backend evidence API.
            resetEvidenceDisplay();

            console.log("Issue loaded:", issue);
        } catch (error) {
            result.hidden = true;
            console.error("Track issue error:", error);
            alert("Unable to find this Report ID. Check the ID and try again.");
        }
    });
}

function normalizeReportId(value) {
    const cleaned = String(value || "")
        .trim()
        .replace(/^RR-/i, "");

    return /^\d+$/.test(cleaned) ? cleaned : "";
}

/* ========================= SET TEXT ========================= */

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent =
            value == null || value === "" ? "-" : value;
    }
}

/* ========================= STATUS TIMELINE ========================= */

function updateTimeline(status) {
    const elementIds = [
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

    let activeIndex = stages.findIndex(stage =>
        stage.some(value => value.toLowerCase() === String(status).toLowerCase())
    );

    if (activeIndex < 0) activeIndex = 0;

    elementIds.forEach(function (id, index) {
        const element = document.getElementById(id);
        if (!element) return;

        element.classList.remove("completed", "active");

        if (index < activeIndex) {
            element.classList.add("completed");
        } else if (index === activeIndex) {
            element.classList.add("active", "completed");
        }
    });
}

/* ========================= BEFORE / AFTER DISPLAY ========================= */

function resetEvidenceDisplay() {
    const beforeImage = document.getElementById("beforePhotoDisplay");
    const afterImage = document.getElementById("afterPhotoDisplay");
    const beforeStatus = document.getElementById("beforeEvidenceStatus");
    const afterStatus = document.getElementById("afterEvidenceStatus");

    if (beforeImage) {
        beforeImage.removeAttribute("src");
        beforeImage.style.display = "none";
    }

    if (afterImage) {
        afterImage.removeAttribute("src");
        afterImage.style.display = "none";
    }

    if (beforeStatus) beforeStatus.textContent = "Before photo connection pending.";
    if (afterStatus) afterStatus.textContent = "After photo connection pending.";
}

/* ========================= REPORT PHOTO NAMES ========================= */

function setupPhotoNames() {
    [
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
        display.textContent =
            this.files && this.files.length > 0
                ? this.files[0].name
                : "";
    });
}

/* ========================= DASHBOARD ISSUE TABLE ========================= */

async function loadDashboardIssues() {
    const table = document.querySelector(".issue-table tbody");
    if (!table) return;

    try {
        const response = await fetch(`${API_BASE}/api/issues`);

        if (!response.ok) {
            throw new Error(`Could not load issues (${response.status})`);
        }

        const issues = await response.json();
        table.innerHTML = "";

        if (!Array.isArray(issues) || issues.length === 0) {
            table.innerHTML =
                '<tr><td colspan="6">No issues reported yet.</td></tr>';
            return;
        }

        issues.forEach(function (issue) {
            const row = document.createElement("tr");

            const values = [
                `RR-${issue.reportId}`,
                `${issue.station || "-"} — Platform ${issue.platform || "-"}`,
                issue.issueType || "-",
                issue.priority || "Medium",
                issue.status || "Reported"
            ];

            values.forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const link = document.createElement("a");

            link.href =
                `issue-details.html?id=RR-${encodeURIComponent(issue.reportId)}`;
            link.className = "view-button";
            link.textContent = "View";

            actionCell.appendChild(link);
            row.appendChild(actionCell);
            table.appendChild(row);
        });
    } catch (error) {
        console.error("Dashboard issues error:", error);
    }
}

/* ========================= DASHBOARD STATISTICS ========================= */

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/api/issues`);

        if (!response.ok) {
            throw new Error(`Could not load statistics (${response.status})`);
        }

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
            cards[1].textContent = requiresAction;
            cards[2].textContent = underMaintenance;
            cards[3].textContent = resolved;
        }
    } catch (error) {
        console.error("Dashboard statistics error:", error);
    }
}

/* ========================= ISSUE DETAILS PAGE ========================= */

async function loadIssueDetails() {
    const reportIdElement = document.getElementById("detailReportId");
    if (!reportIdElement) return;

    const params = new URLSearchParams(window.location.search);
    const reportId = normalizeReportId(params.get("id"));

    if (!reportId) return;

    try {
        const response = await fetch(`${API_BASE}/api/issues/${reportId}`);

        if (!response.ok) {
            throw new Error(`Issue not found (${response.status})`);
        }

        const issue = await response.json();

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

/* ========================= UPDATE ISSUE STATUS ========================= */

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
                `${API_BASE}/api/issues/${reportId}/status?status=${encodeURIComponent(select.value)}`,
                { method: "PUT" }
            );

            if (!response.ok) {
                throw new Error(`Status update failed (${response.status})`);
            }

            const issue = await response.json();

            setText("detailStatus", issue.status);
            setText("detailReportStatus", issue.status);

            alert(`Issue status updated to: ${issue.status}`);
        } catch (error) {
            console.error("Status update error:", error);
            alert("Unable to update issue status. Please try again.");
        }
    });
}
