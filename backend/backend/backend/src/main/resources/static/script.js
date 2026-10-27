/* =========================================================
   RAILSAFE - MAIN JAVASCRIPT
   Reports, Tracking, Dashboard, Maintenance and Evidence
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

/* ---------------- COMMON HELPERS ---------------- */

function el(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const node = el(id);
    if (node) node.textContent = value ?? "-";
}

function message(node, text, success = false) {
    if (!node) return;
    node.textContent = text;
    node.style.color = success ? "green" : "red";
}

function reportId(value) {
    return String(value ?? "").trim().replace(/^RR-/i, "");
}

function currentReportId() {
    return reportId(new URLSearchParams(location.search).get("id"));
}

async function request(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text}`);
    }

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/* ---------------- REGISTER ---------------- */

function setupRegisterForm() {
    const form = el("registerForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const name = el("registerName");
        const email = el("registerEmail");
        const password = el("registerPassword");

        if (!name?.value.trim() || !email?.value.trim() || !password?.value) {
            message(el("registerMessage"), "Please fill in all fields.");
            return;
        }

        message(
            el("registerMessage"),
            "Registration form is ready, but authentication must be connected to the backend."
        );
    });
}

/* ---------------- LOGIN ---------------- */

function setupLoginForm() {
    const form = el("loginForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const email = el("loginEmail");
        const password = el("loginPassword");

        if (!email?.value.trim() || !password?.value) {
            message(el("loginMessage"), "Enter your email and password.");
            return;
        }

        message(
            el("loginMessage"),
            "Login form is ready, but authentication must be connected to the backend."
        );
    });
}

/* ---------------- REPORT ISSUE ---------------- */

function setupReportForm() {
    const form = el("reportForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const station = el("station");
        const platform = el("platform");
        const type = el("infrastructure");
        const description = el("description");
        const output = el("reportMessage");

        if (
            !station?.value.trim() ||
            !platform?.value.trim() ||
            !type?.value.trim() ||
            !description?.value.trim()
        ) {
            message(output, "Please complete all issue details.");
            return;
        }

        try {
            const issue = await request(`${API_BASE}/api/issues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    station: station.value.trim(),
                    platform: platform.value.trim(),
                    issueType: type.value.trim(),
                    description: description.value.trim(),
                    priority: "Medium",
                    status: "Reported"
                })
            });

            const id = issue?.reportId ?? issue?.id;

            if (id == null) {
                throw new Error("The server did not return a Report ID.");
            }

            message(output, `Report submitted! Your ID is RR-${id}`, true);
            form.reset();
        } catch (error) {
            console.error("Report submission failed:", error);
            message(output, "Report submission failed. Please try again.");
        }
    });
}

/* ---------------- TRACK ISSUE ---------------- */

function setupTrackForm() {
    const form = el("trackForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const input = el("reportId");
        const output = el("trackResult");
        const id = reportId(input?.value);

        if (!id || !/^\d+$/.test(id)) {
            message(output, "Enter a valid Report ID, for example RR-1.");
            return;
        }

        try {
            const issue = await request(
                `${API_BASE}/api/issues/${encodeURIComponent(id)}`
            );

            if (!issue || typeof issue !== "object") {
                throw new Error("Unexpected issue response.");
            }

            displayTrackedIssue(issue);
        } catch (error) {
            console.error("Tracking failed:", error);
            message(
                output,
                "Report could not be found. Check the ID and try again."
            );
        }
    });
}

function displayTrackedIssue(issue) {
    const output = el("trackResult");
    if (output) {
        output.hidden = false;
        output.style.color = "";
    }

    const id = issue.reportId ?? issue.id;

    if (id == null) {
        message(output, "The server response has no Report ID.");
        return;
    }

    setText("trackReportId", `RR-${id}`);
    setText("trackStation", issue.station);
    setText("trackPlatform", issue.platform);
    setText("trackInfrastructure", issue.issueType);
    setText("trackIssueHeading", issue.issueType);
    setText("trackDescription", issue.description || issue.issueType);
    setText("trackLocation", `${issue.station || "-"} - Platform ${issue.platform || "-"}`);
    setText("trackIssueDetected", issue.issueType);
    setText("trackStatus", issue.status || "Reported");

    updateTimeline(issue.status || "Reported");
}

/* ---------------- PHOTO FILE NAMES ---------------- */

function setupPhotoNames() {
    [
        ["issuePhotoCamera", "photoName"],
        ["issuePhotoGallery", "photoName"],
        ["beforePhoto", "beforePhotoName"],
        ["afterPhoto", "afterPhotoName"]
    ].forEach(([inputId, labelId]) => {
        const input = el(inputId);
        const label = el(labelId);

        if (!input || !label) return;

        input.addEventListener("change", () => {
            label.textContent = input.files?.[0]?.name || "";
        });
    });
}

/* ---------------- TRACKING TIMELINE ---------------- */

function updateTimeline(status) {
    const stages = [
        { id: "timelineReported", values: ["reported"] },
        { id: "timelineAssigned", values: ["assigned", "inspection"] },
        { id: "timelineMaintenance", values: ["under maintenance", "in progress"] },
        { id: "timelineResolved", values: ["resolved", "completed"] },
        { id: "timelineClosed", values: ["closed"] }
    ];

    let active = stages.findIndex(stage =>
        stage.values.includes(String(status).toLowerCase())
    );

    if (active < 0) active = 0;

    stages.forEach((stage, index) => {
        const node = el(stage.id);
        if (!node) return;

        node.classList.remove("completed", "active");

        if (index < active) node.classList.add("completed");

        if (index === active) {
            node.classList.add("completed", "active");
        }
    });
}

/* ---------------- DASHBOARD ISSUES ---------------- */

async function loadDashboardIssues() {
    const tbody = document.querySelector(".issue-table tbody");
    if (!tbody) return;

    try {
        const issues = await request(`${API_BASE}/api/issues`);

        if (!Array.isArray(issues)) {
            throw new Error("Issues response is not a list.");
        }

        tbody.innerHTML = "";

        if (issues.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="6">No issues reported yet.</td></tr>';
            return;
        }

        issues.forEach(issue => {
            const id = issue.reportId ?? issue.id;
            const row = document.createElement("tr");

            [
                id == null ? "-" : `RR-${id}`,
                `${issue.station || "-"} - Platform ${issue.platform || "-"}`,
                issue.issueType || "-",
                issue.priority || "Medium",
                issue.status || "Reported"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");
            const link = document.createElement("a");

            link.textContent = "View";
            link.className = "view-button";
            link.href = `issue-details.html?id=${encodeURIComponent(id ?? "")}`;

            actionCell.appendChild(link);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Dashboard loading failed:", error);
        tbody.innerHTML =
            '<tr><td colspan="6">Unable to load issues.</td></tr>';
    }
}

/* ---------------- DASHBOARD STATISTICS ---------------- */

async function loadDashboardStats() {
    try {
        const issues = await request(`${API_BASE}/api/issues`);
        if (!Array.isArray(issues)) return;

        const active = issues.filter(issue =>
            ["Reported", "Assigned", "Inspection"].includes(issue.status)
        ).length;

        const maintenance = issues.filter(issue =>
            ["Under Maintenance", "In Progress"].includes(issue.status)
        ).length;

        const resolved = issues.filter(issue =>
            ["Resolved", "Closed", "Completed"].includes(issue.status)
        ).length;

        const cards = document.querySelectorAll(".dashboard-cards .card h2");

        if (cards[0]) cards[0].textContent = issues.length;
        if (cards[1]) cards[1].textContent = active;
        if (cards[2]) cards[2].textContent = maintenance;
        if (cards[3]) cards[3].textContent = resolved;
    } catch (error) {
        console.error("Dashboard statistics failed:", error);
    }
}

/* ---------------- ISSUE DETAILS ---------------- */

async function loadIssueDetails() {
    if (!el("detailReportId")) return;

    const id = currentReportId();

    if (!id || !/^\d+$/.test(id)) {
        setText("detailReportId", "No valid Report ID provided");
        return;
    }

    try {
        const issue = await request(
            `${API_BASE}/api/issues/${encodeURIComponent(id)}`
        );

        const actualId = issue?.reportId ?? issue?.id;
        if (actualId == null) throw new Error("Issue was not found.");

        setText("detailReportId", `RR-${actualId}`);
        setText("detailStation", issue.station);
        setText("detailPlatform", issue.platform);
        setText("detailIssueType", issue.issueType);
        setText("detailStatus", issue.status || "Reported");
        setText("detailReportedIssue", issue.description || issue.issueType);
        setText("detailLocation", `${issue.station || "-"} - Platform ${issue.platform || "-"}`);
        setText("detailReportStatus", issue.status || "Reported");
        setText("detailPriority", issue.priority || "Medium");

        const select = el("issueStatus");
        if (select) select.value = issue.status || "Reported";

        await loadMaintenanceAndEvidence(id);
    } catch (error) {
        console.error("Issue details failed:", error);
        setText("detailReportId", "Unable to load issue details");
    }
}

/* ---------------- LOAD MAINTENANCE AND EVIDENCE ---------------- */

async function loadMaintenanceAndEvidence(id) {
    try {
        const data = await request(
            `${API_BASE}/api/maintenance/${encodeURIComponent(id)}`
        );

        if (data) {
            setText("assignedTeamDisplay", data.assignedTeam || "Not Assigned");
            setText("assignedOfficerDisplay", data.assignedOfficer || "Not Assigned");
            setText("maintenanceStatusDisplay", data.maintenanceStatus || "Not Assigned");

            if (el("assignedTeam")) el("assignedTeam").value = data.assignedTeam || "";
            if (el("assignedOfficer")) el("assignedOfficer").value = data.assignedOfficer || "";

            if (el("maintenanceStatus") && data.maintenanceStatus) {
                el("maintenanceStatus").value = data.maintenanceStatus;
            }
        }
    } catch (error) {
        console.warn("Maintenance record not available:", error);
    }

    try {
        const evidence = await request(
            `${API_BASE}/api/evidence/${encodeURIComponent(id)}`
        );

        if (evidence) displayEvidence(evidence);
    } catch (error) {
        console.warn("Evidence record not available:", error);
    }
}

/* ---------------- DISPLAY SAVED EVIDENCE ---------------- */

function displayEvidence(evidence) {
    const before = el("savedBeforePhoto");
    const after = el("savedAfterPhoto");

    if (before && evidence.beforePhoto) {
        before.src = evidence.beforePhoto;
        before.hidden = false;
    }

    if (after && evidence.afterPhoto) {
        after.src = evidence.afterPhoto;
        after.hidden = false;
    }
}

/* ---------------- SAVE MAINTENANCE ---------------- */

function setupMaintenanceForm() {
    const form = el("maintenanceForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = currentReportId();
        const team = el("assignedTeam");
        const officer = el("assignedOfficer");
        const status = el("maintenanceStatus");
        const output = el("maintenanceMessage");

        if (!id || !/^\d+$/.test(id)) {
            message(output, "Open an issue from the dashboard first.");
            return;
        }

        if (!team?.value.trim() || !officer?.value.trim() || !status?.value) {
            message(output, "Please fill in all maintenance fields.");
            return;
        }

        try {
            const payload = {
                reportId: Number(id),
                assignedTeam: team.value.trim(),
                assignedOfficer: officer.value.trim(),
                maintenanceStatus: status.value
            };

            const saved = await request(
                `${API_BASE}/api/maintenance/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            setText("assignedTeamDisplay", saved?.assignedTeam || payload.assignedTeam);
            setText("assignedOfficerDisplay", saved?.assignedOfficer || payload.assignedOfficer);
            setText("maintenanceStatusDisplay", saved?.maintenanceStatus || payload.maintenanceStatus);

            message(output, "Maintenance details saved successfully.", true);
        } catch (error) {
            console.error("Maintenance save failed:", error);
            message(output, "Could not save maintenance details.");
        }
    });
}

/* ---------------- EVIDENCE BUTTONS ---------------- */

function setupEvidenceForm() {
    const uploadButton = el("uploadEvidenceButton");

    if (uploadButton) {
        uploadButton.addEventListener("click", uploadEvidence);
    }
}

function selectedPhotos() {
    return {
        before: el("beforePhoto")?.files?.[0],
        after: el("afterPhoto")?.files?.[0]
    };
}

/* ---------------- UPLOAD EVIDENCE ---------------- */

async function uploadEvidence() {
    const id = currentReportId();
    const output = el("evidenceMessage");
    const photos = selectedPhotos();

    if (!id || !/^\d+$/.test(id)) {
        message(output, "Open a valid issue from the dashboard first.");
        return;
    }

    if (!photos.before && !photos.after) {
        message(output, "Please select a photo first.");
        return;
    }

    const formData = new FormData();
    formData.append("reportId", id);

    if (photos.before) formData.append("beforePhoto", photos.before);
    if (photos.after) formData.append("afterPhoto", photos.after);

    try {
        const saved = await request(`${API_BASE}/api/evidence/upload`, {
            method: "POST",
            body: formData
        });

        if (saved && typeof saved === "object") displayEvidence(saved);

        message(output, "Evidence uploaded successfully.", true);
    } catch (error) {
        console.error("Evidence upload failed:", error);
        message(output, "Evidence upload failed. Please check the backend.");
    }
}

/* ---------------- COMPARE PHOTOS ---------------- */

async function compareEvidence() {
    const output = el("comparisonResult");
    const photos = selectedPhotos();

    if (!photos.before || !photos.after) {
        message(output, "Please select both Before and After photos.");
        return;
    }

    const formData = new FormData();
    formData.append("before", photos.before);
    formData.append("after", photos.after);

    const button = el("compareEvidenceButton");

    try {
        if (button) button.disabled = true;

        message(output, "Comparing photos...");

        const result = await request(`${API_BASE}/api/evidence/compare`, {
            method: "POST",
            body: formData
        });

        const percent =
            result?.change_percent ??
            result?.changePercent ??
            result?.percentage;

        message(
            output,
            percent == null
                ? "Comparison completed, but no percentage was returned."
                : `Visual difference: ${percent}%`,
            true
        );
    } catch (error) {
        console.error("Photo comparison failed:", error);
        message(output, "Photo comparison failed.");
    } finally {
        if (button) button.disabled = false;
    }
}

/* ---------------- UPDATE ISSUE STATUS ---------------- */

function setupIssueDetailsStatus() {
    const button = el("updateStatusButton");
    const select = el("issueStatus");

    if (!button || !select) return;

    button.addEventListener("click", async () => {
        const id = currentReportId();
        const output = el("statusMessage");

        if (!id || !/^\d+$/.test(id)) {
            alert("No valid Report ID. Open the issue from Dashboard > View.");
            return;
        }

        const status = select.value;

        if (!status) {
            message(output, "Select a status first.");
            return;
        }

        if (["Resolved", "Closed"].includes(status)) {
            try {
                const evidence = await request(
                    `${API_BASE}/api/evidence/${encodeURIComponent(id)}`
                );

                if (!evidence?.afterPhoto) {
                    alert("Upload the After photo before resolving or closing the issue.");
                    return;
                }
            } catch (error) {
                alert("Could not verify After photo evidence. Please try again.");
                return;
            }
        }

        try {
            const updated = await request(
                `${API_BASE}/api/issues/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`,
                { method: "PUT" }
            );

            const finalStatus = updated?.status || status;

            setText("detailStatus", finalStatus);
            setText("detailReportStatus", finalStatus);
            select.value = finalStatus;

            message(output, `Status updated to ${finalStatus}.`, true);

            await loadDashboardIssues();
            await loadDashboardStats();
        } catch (error) {
            console.error("Status update failed:", error);
            message(output, "Status update failed. Please try again.");
        }
    });
}   
