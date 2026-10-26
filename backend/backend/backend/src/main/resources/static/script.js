
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

        const id = normalizeReportId(input.value);
<<<<<<< HEAD

=======
>>>>>>> origin/main
        if (!id) {
            alert("Enter a valid Report ID, for example RR-1.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/issues/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const issue = await response.json();
<<<<<<< HEAD

            if (!issue || issue.reportId == null) {
                throw new Error("Issue not found");
            }
=======
            if (!issue || issue.reportId == null) throw new Error("Issue not found");
>>>>>>> origin/main

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

/* ================= PHOTO FILE NAMES ================= */

function setupPhotoNames() {
    [
        ["issuePhotoCamera", "photoName"],
        ["issuePhotoGallery", "photoName"],
        ["beforePhoto", "beforePhotoName"],
        ["afterPhoto", "afterPhotoName"]
    ].forEach(([inputId, displayId]) => {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
<<<<<<< HEAD

=======
>>>>>>> origin/main
        if (!input || !display) return;

        input.addEventListener("change", () => {
            display.textContent = input.files?.[0]?.name || "";
        });
    });
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

        el.classList.remove("completed", "active");
<<<<<<< HEAD

=======
>>>>>>> origin/main
        if (index < active) el.classList.add("completed");
        if (index === active) el.classList.add("completed", "active");
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

        if (!Array.isArray(issues) || !issues.length) {
<<<<<<< HEAD
            table.innerHTML =
                '<tr><td colspan="6">No issues reported yet.</td></tr>';
=======
            table.innerHTML = '<tr><td colspan="6">No issues reported yet.</td></tr>';
>>>>>>> origin/main
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
<<<<<<< HEAD

            link.href =
                `issue-details.html?id=RR-${encodeURIComponent(issue.reportId)}`;

            link.className = "view-button";
            link.textContent = "View";

=======
            link.href = `issue-details.html?id=RR-${encodeURIComponent(issue.reportId)}`;
            link.className = "view-button";
            link.textContent = "View";
>>>>>>> origin/main
            action.appendChild(link);
            row.appendChild(action);
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
<<<<<<< HEAD

        const action = issues.filter(issue =>
            ["Reported", "Assigned", "Inspection"].includes(issue.status)
        ).length;

        const maintenance = issues.filter(issue =>
            issue.status === "Under Maintenance"
        ).length;

=======
        const action = issues.filter(issue =>
            ["Reported", "Assigned", "Inspection"].includes(issue.status)
        ).length;
        const maintenance = issues.filter(issue =>
            issue.status === "Under Maintenance"
        ).length;
>>>>>>> origin/main
        const resolved = issues.filter(issue =>
            ["Resolved", "Closed"].includes(issue.status)
        ).length;

<<<<<<< HEAD
        const cards = document.querySelectorAll(
            ".dashboard-cards .card h2"
        );

=======
        const cards = document.querySelectorAll(".dashboard-cards .card h2");
>>>>>>> origin/main
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

<<<<<<< HEAD
/* ================= ISSUE DETAILS ================= */
=======
/* ================= ISSUE DETAILS + RELATED RECORDS ================= */
>>>>>>> origin/main

async function loadIssueDetails() {
    if (!document.getElementById("detailReportId")) return;

    const id = currentReportId();
<<<<<<< HEAD

=======
>>>>>>> origin/main
    if (!id) {
        setText("detailReportId", "No Report ID provided");
        return;
    }

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

        await loadMaintenanceAndEvidence(id);
    } catch (error) {
        console.error("Issue details loading error:", error);
<<<<<<< HEAD
        setText("detailReportId", "Unable to load issue details");
    }
}

/* ================= LOAD MAINTENANCE AND EVIDENCE ================= */

async function loadMaintenanceAndEvidence(id) {
    try {
        const response = await fetch(`${API_BASE}/api/maintenance/${id}`);

        if (response.ok) {
            const m = await response.json();

            if (m && m.reportId != null) {
                setText("assignedTeamDisplay", m.assignedTeam || "Not Assigned");
                setText("assignedOfficerDisplay", m.assignedOfficer || "Awaiting Assignment");
                setText("maintenanceStatusDisplay", m.maintenanceStatus || "Not Assigned");

                const team = document.getElementById("assignedTeam");
                const officer = document.getElementById("assignedOfficer");
                const status = document.getElementById("maintenanceStatus");

                if (team) team.value = m.assignedTeam || "";
                if (officer) officer.value = m.assignedOfficer || "";
                if (status && m.maintenanceStatus) {
                    status.value = m.maintenanceStatus;
                }
            }
        }
    } catch (error) {
        console.error("Maintenance load error:", error);
    }

    try {
        const response = await fetch(`${API_BASE}/api/evidence/${id}`);

        if (response.ok) {
            const evidence = await response.json();
            if (evidence) displayEvidence(evidence);
        }
    } catch (error) {
        console.error("Evidence load error:", error);
    }
}

/* ================= DISPLAY SAVED EVIDENCE ================= */

function displayEvidence(evidence) {
    const before = document.getElementById("savedBeforePhoto");
    const after = document.getElementById("savedAfterPhoto");

    if (before) {
        before.hidden = !evidence.beforePhoto;

        if (evidence.beforePhoto) {
            before.src = evidence.beforePhoto;
        }
    }

    if (after) {
        after.hidden = !evidence.afterPhoto;

        if (evidence.afterPhoto) {
            after.src = evidence.afterPhoto;
        }
    }
}

/* ================= SAVE MAINTENANCE ================= */

function setupMaintenanceForm() {
    const form = document.getElementById("maintenanceForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = currentReportId();
        const team = document.getElementById("assignedTeam");
        const officer = document.getElementById("assignedOfficer");
        const status = document.getElementById("maintenanceStatus");
        const message = document.getElementById("maintenanceMessage");

        if (!id) {
            showMessage(message, "Open issue details using a valid Report ID.");
            return;
        }

        if (!team?.value.trim() || !officer?.value.trim() || !status?.value) {
            showMessage(message, "Complete all maintenance fields.");
            return;
        }

        try {
            let existing = null;

            const getResponse = await fetch(
                `${API_BASE}/api/maintenance/${id}`
            );

            if (getResponse.ok) {
                existing = await getResponse.json();
            }

            const now = new Date().toISOString().slice(0, 19);

            const payload = {
                reportId: Number(id),
                assignedTeam: team.value.trim(),
                assignedOfficer: officer.value.trim(),
                maintenanceStatus: status.value,

                startedAt: status.value === "Under Maintenance"
                    ? (existing?.startedAt || now)
                    : (existing?.startedAt || null),

                completedAt: status.value === "Completed"
                    ? now
                    : (existing?.completedAt || null)
            };

            const response = await fetch(
                `${API_BASE}/api/maintenance/${id}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const saved = await response.json();

            setText("assignedTeamDisplay", saved.assignedTeam);
            setText("assignedOfficerDisplay", saved.assignedOfficer);
            setText("maintenanceStatusDisplay", saved.maintenanceStatus);

            showMessage(
                message,
                "Maintenance assignment saved successfully.",
                true
            );
        } catch (error) {
            console.error("Maintenance save error:", error);
            showMessage(
                message,
                "Could not save maintenance. Check backend logs."
            );
        }
    });
}

/* ================= UPLOAD AND COMPARE PHOTOS ================= */

function setupEvidenceForm() {
    const upload = document.getElementById("uploadEvidenceButton");
    const compare = document.getElementById("compareEvidenceButton");

    if (upload) upload.addEventListener("click", uploadEvidence);
    if (compare) compare.addEventListener("click", compareEvidence);
}

function getSelectedPhotos() {
    return {
        before: document.getElementById("beforePhoto")?.files?.[0],
        after: document.getElementById("afterPhoto")?.files?.[0]
    };
}

async function uploadEvidence() {
    const id = currentReportId();
    const message = document.getElementById("evidenceMessage");
    const photos = getSelectedPhotos();

    if (!id) {
        showMessage(message, "Open issue details using a valid Report ID.");
        return;
    }

    if (!photos.before && !photos.after) {
        showMessage(message, "Choose at least one photo to upload.");
        return;
    }

    const data = new FormData();
    data.append("reportId", id);

    if (photos.before) data.append("beforePhoto", photos.before);
    if (photos.after) data.append("afterPhoto", photos.after);

    try {
        const response = await fetch(`${API_BASE}/api/evidence/upload`, {
            method: "POST",
            body: data
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const evidence = await response.json();

        displayEvidence(evidence);
        showMessage(message, "Evidence saved successfully.", true);
    } catch (error) {
        console.error("Evidence upload error:", error);
        showMessage(
            message,
            "Upload failed. Check backend logs and connection."
        );
    }
}

async function compareEvidence() {
    const message = document.getElementById("comparisonResult");
    const photos = getSelectedPhotos();

    if (!photos.before || !photos.after) {
        showMessage(message, "Select both Before and After photos first.");
        return;
    }

    const data = new FormData();
    data.append("beforePhoto", photos.before);
    data.append("afterPhoto", photos.after);

    const button = document.getElementById("compareEvidenceButton");

    try {
        if (button) button.disabled = true;
        showMessage(message, "Comparing photos...");

        const response = await fetch(`${API_BASE}/api/evidence/compare`, {
            method: "POST",
            body: data
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        showMessage(
            message,
            `Visual difference: ${result.change_percent}%\n` +
            `${result.note || result.message || "Comparison completed."}`,
            true
        );
    } catch (error) {
        console.error("Photo comparison error:", error);
        showMessage(
            message,
            "Comparison failed. Check the backend connection."
        );
    } finally {
        if (button) button.disabled = false;
    }
}

/* ================= UPDATE ISSUE STATUS ================= */
=======
    }
}

async function loadMaintenanceAndEvidence(id) {
    try {
        const response = await fetch(`${API_BASE}/api/maintenance/${id}`);
>>>>>>> origin/main

        if (response.ok) {
            const m = await response.json();
            if (m && m.reportId != null) {
                setText("assignedTeamDisplay", m.assignedTeam || "Not Assigned");
                setText("assignedOfficerDisplay", m.assignedOfficer || "Awaiting Assignment");
                setText("maintenanceStatusDisplay", m.maintenanceStatus || "Not Assigned");

                const team = document.getElementById("assignedTeam");
                const officer = document.getElementById("assignedOfficer");
                const status = document.getElementById("maintenanceStatus");

<<<<<<< HEAD
    button.addEventListener("click", async () => {
        const id = currentReportId();

        if (!id) {
            alert("No valid Report ID found. Open View from Dashboard.");
=======
                if (team) team.value = m.assignedTeam || "";
                if (officer) officer.value = m.assignedOfficer || "";
                if (status && m.maintenanceStatus) status.value = m.maintenanceStatus;
            }
        }
    } catch (error) {
        console.error("Maintenance load error:", error);
    }

    try {
        const response = await fetch(`${API_BASE}/api/evidence/${id}`);
        if (response.ok) {
            const evidence = await response.json();
            if (evidence) displayEvidence(evidence);
        }
    } catch (error) {
        console.error("Evidence load error:", error);
    }
}

function displayEvidence(evidence) {
    const before = document.getElementById("savedBeforePhoto");
    const after = document.getElementById("savedAfterPhoto");

    if (before) {
        before.hidden = !evidence.beforePhoto;
        if (evidence.beforePhoto) before.src = evidence.beforePhoto;
    }

    if (after) {
        after.hidden = !evidence.afterPhoto;
        if (evidence.afterPhoto) after.src = evidence.afterPhoto;
    }
}

/* ================= SAVE MAINTENANCE ================= */

function setupMaintenanceForm() {
    const form = document.getElementById("maintenanceForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const id = currentReportId();
        const team = document.getElementById("assignedTeam");
        const officer = document.getElementById("assignedOfficer");
        const status = document.getElementById("maintenanceStatus");
        const message = document.getElementById("maintenanceMessage");

        if (!id) {
            showMessage(message, "Open issue details using a valid Report ID.");
            return;
        }

        if (!team?.value.trim() || !officer?.value.trim() || !status?.value) {
            showMessage(message, "Complete all maintenance fields.");
>>>>>>> origin/main
            return;
        }

        const requestedStatus = select.value;

        if (["Resolved", "Closed"].includes(requestedStatus)) {
            try {
                const response = await fetch(`${API_BASE}/api/evidence/${id}`);
                const evidence = response.ok ? await response.json() : null;

                if (!evidence?.afterPhoto) {
                    alert(
                        "Upload After evidence before marking the issue Resolved or Closed."
                    );
                    return;
                }

                if (!confirm(
                    "Confirm that an authorised officer has verified the repair?"
                )) {
                    return;
                }
            } catch (error) {
                console.error("Evidence verification error:", error);
                alert("Could not verify saved evidence. Try again.");
                return;
            }
        }

        try {
<<<<<<< HEAD
            const response = await fetch(
                `${API_BASE}/api/issues/${id}/status?status=${encodeURIComponent(requestedStatus)}`,
                { method: "PUT" }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
=======
            let existing = null;
            const getResponse = await fetch(`${API_BASE}/api/maintenance/${id}`);
            if (getResponse.ok) existing = await getResponse.json();

            const now = new Date().toISOString().slice(0, 19);
            const payload = {
                reportId: Number(id),
                assignedTeam: team.value.trim(),
                assignedOfficer: officer.value.trim(),
                maintenanceStatus: status.value,
                startedAt: status.value === "Under Maintenance"
                    ? (existing?.startedAt || now)
                    : (existing?.startedAt || null),
                completedAt: status.value === "Completed"
                    ? now
                    : (existing?.completedAt || null)
            };
>>>>>>> origin/main

            const response = await fetch(`${API_BASE}/api/maintenance/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

<<<<<<< HEAD
            if (!issue || issue.reportId == null) {
                throw new Error("Issue not found");
            }

            setText("detailStatus", issue.status);
            setText("detailReportStatus", issue.status);
            select.value = issue.status;

            await loadIssueDetails();
            await loadDashboardIssues();
            await loadDashboardStats();
=======
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
>>>>>>> origin/main

            const saved = await response.json();
            setText("assignedTeamDisplay", saved.assignedTeam);
            setText("assignedOfficerDisplay", saved.assignedOfficer);
            setText("maintenanceStatusDisplay", saved.maintenanceStatus);
            showMessage(message, "Maintenance assignment saved successfully.", true);
        } catch (error) {
<<<<<<< HEAD
            console.error("Status update error:", error);
            alert("Unable to update issue status. Please try again.");
        }
    });
}
=======
            console.error("Maintenance save error:", error);
            showMessage(message, "Could not save maintenance. Check backend logs.");
        }
    });
}

/* ================= UPLOAD AND COMPARE PHOTOS ================= */

function setupEvidenceForm() {
    const upload = document.getElementById("uploadEvidenceButton");
    const compare = document.getElementById("compareEvidenceButton");

    if (upload) upload.addEventListener("click", uploadEvidence);
    if (compare) compare.addEventListener("click", compareEvidence);
}

function getSelectedPhotos() {
    return {
        before: document.getElementById("beforePhoto")?.files?.[0],
        after: document.getElementById("afterPhoto")?.files?.[0]
    };
}

async function uploadEvidence() {
    const id = currentReportId();
    const message = document.getElementById("evidenceMessage");
    const photos = getSelectedPhotos();

    if (!id) {
        showMessage(message, "Open issue details using a valid Report ID.");
        return;
    }

    if (!photos.before && !photos.after) {
        showMessage(message, "Choose at least one photo to upload.");
        return;
    }

    const data = new FormData();
    data.append("reportId", id);
    if (photos.before) data.append("beforePhoto", photos.before);
    if (photos.after) data.append("afterPhoto", photos.after);

    try {
        const response = await fetch(`${API_BASE}/api/evidence/upload`, {
            method: "POST",
            body: data
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const evidence = await response.json();
        displayEvidence(evidence);
        showMessage(message, "Evidence saved successfully.", true);
    } catch (error) {
        console.error("Evidence upload error:", error);
        showMessage(message, "Upload failed. Check backend logs and connection.");
    }
}

async function compareEvidence() {
    const message = document.getElementById("comparisonResult");
    const photos = getSelectedPhotos();

    if (!photos.before || !photos.after) {
        showMessage(message, "Select both Before and After photos first.");
        return;
    }

    const data = new FormData();
    data.append("beforePhoto", photos.before);
    data.append("afterPhoto", photos.after);

    try {
        const button = document.getElementById("compareEvidenceButton");
        if (button) button.disabled = true;
        showMessage(message, "Comparing photos...");

        const response = await fetch(`${API_BASE}/api/evidence/compare`, {
            method: "POST",
            body: data
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();
        showMessage(
            message,
            `Visual difference: ${result.change_percent}%\n` +
            `${result.note || result.message || "Comparison completed."}`,
            true
        );
    } catch (error) {
        console.error("Photo comparison error:", error);
        showMessage(message, "Comparison failed. Check the backend connection.");
    } finally {
        const button = document.getElementById("compareEvidenceButton");
        if (button) button.disabled = false;
    }
}

/* ================= UPDATE ISSUE STATUS ================= */

function setupIssueDetailsStatus() {
    const button = document.getElementById("updateStatusButton");
    const select = document.getElementById("issueStatus");
    if (!button || !select) return;

    button.addEventListener("click", async () => {
        const id = currentReportId();
        if (!id) {
            alert("No valid Report ID found.");
            return;
        }

        const requestedStatus = select.value;

        if (["Resolved", "Closed"].includes(requestedStatus)) {
            try {
                const response = await fetch(`${API_BASE}/api/evidence/${id}`);
                const evidence = response.ok ? await response.json() : null;

                if (!evidence?.afterPhoto) {
                    alert("Upload After evidence before marking the issue Resolved or Closed.");
                    return;
                }

                if (!confirm("Confirm that an authorised officer has verified the repair?")) {
                    return;
                }
            } catch (error) {
                alert("Could not verify saved evidence. Try again.");
                return;
            }
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
>>>>>>> origin/main
