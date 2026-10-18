/* =========================================================
   RAILSAFE - MAIN JAVASCRIPT
   Issue reporting, tracking and maintenance management
   Before/After evidence supported; no photo comparison/CV
   ========================================================= */

const API_BASE = "https://railsafe-2.onrender.com";

document.addEventListener("DOMContentLoaded", function () {
    setupRegisterForm();
    setupLoginForm();
    setupReportForm();
    setupTrackForm();
    setupPhotoNames();
    loadDashboardIssues();
    loadDashboardStats();
    loadIssueDetails();
    setupIssueDetailsStatus();
    setupEvidenceControls();
});

/* COMMON HELPERS */

function showMessage(element, message, success) {
    if (!element) return;
    element.textContent = message;
    element.style.color = success ? "#177245" : "#b42318";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent =
            value == null || value === "" ? "-" : value;
    }
}

function setFirstText(ids, value) {
    for (const id of ids) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent =
                value == null || value === "" ? "-" : value;
            return;
        }
    }
}

function normalizeReportId(value) {
    const cleaned = String(value || "")
        .trim()
        .replace(/^RR-/i, "");

    return /^\d+$/.test(cleaned) ? cleaned : "";
}

/* REGISTER */

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

        if (!name.value.trim() ||
            !email.value.trim() ||
            !password.value) {
            showMessage(message, "Please fill all required fields.", false);
            return;
        }

        if (password.value.length < 6) {
            showMessage(
                message,
                "Password must contain at least 6 characters.",
                false
            );
            return;
        }

        showMessage(
            message,
            "Registration form validated successfully.",
            true
        );
    });
}

/* LOGIN */

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
            showMessage(
                message,
                "Please enter your email and password.",
                false
            );
            return;
        }

        showMessage(
            message,
            "Login form validated successfully.",
            true
        );
    });
}

/* REPORT ISSUE */

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

        if (!station || !platform || !infrastructure || !description) {
            return;
        }

        if (
            !station.value.trim() ||
            !platform.value.trim() ||
            !infrastructure.value.trim() ||
            !description.value.trim()
        ) {
            showMessage(
                message,
                "Please complete all required issue details.",
                false
            );
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/issues`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
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
                throw new Error(
                    `Issue submission failed (${response.status})`
                );
            }

            const issue = await response.json();
            const id = issue.reportId ?? issue.id;

            if (id != null) {
                showMessage(
                    message,
                    `Issue reported successfully. Report ID: RR-${id}`,
                    true
                );
            } else {
                showMessage(
                    message,
                    "Issue submitted, but no Report ID was returned.",
                    false
                );
            }

            form.reset();
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

/* TRACK ISSUE */

function setupTrackForm() {
    const form = document.getElementById("trackForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const input = document.getElementById("reportId");
        const result = document.getElementById("trackResult");
        const message =
            document.getElementById("message") ||
            document.getElementById("trackMessage") ||
            document.getElementById("evidenceMessage");

        if (!input) return;

        const reportId = normalizeReportId(input.value);

        if (!reportId) {
            showMessage(
                message,
                "Enter a valid Report ID, for example RR-4.",
                false
            );
            return;
        }

        showMessage(message, "Searching for issue...", true);

        try {
            const response = await fetch(
                `${API_BASE}/api/issues/${encodeURIComponent(reportId)}`
            );

            if (response.status === 404) {
                throw new Error("No issue exists with that Report ID.");
            }

            if (!response.ok) {
                throw new Error(`Issue lookup failed (${response.status}).`);
            }

            const issue = await response.json();

            if (
                !issue ||
                (issue.reportId == null && issue.id == null)
            ) {
                throw new Error("No issue exists with that Report ID.");
            }

            const id = issue.reportId ?? issue.id;

            if (result) result.hidden = false;

            setFirstText(
                ["trackReportId", "detailReportId"],
                `RR-${id}`
            );

            setFirstText(
                ["trackStation", "detailStation"],
                issue.station
            );

            setFirstText(
                ["trackPlatform", "detailPlatform"],
                issue.platform == null
                    ? "-"
                    : `Platform ${issue.platform}`
            );

            setFirstText(
                [
                    "trackInfrastructure",
                    "trackIssueHeading",
                    "detailIssueType",
                    "detailIssue"
                ],
                issue.issueType
            );

            setFirstText(
                [
                    "trackDescription",
                    "detailDescription",
                    "detailReportedIssue"
                ],
                issue.description || issue.issueType
            );

            setFirstText(
                ["trackLocation", "detailLocation"],
                `${issue.station || "-"} — Platform ${issue.platform ?? "-"}`
            );

            setFirstText(
                ["trackIssueDetected"],
                issue.issueType
            );

            setFirstText(
                ["trackStatus", "detailStatus", "detailReportStatus"],
                issue.status || "Reported"
            );

            setFirstText(
                ["detailSeverity", "detailPriority"],
                issue.priority || "Medium"
            );

            updateTimeline(issue.status || "Reported");

            await loadEvidence(reportId);

            showMessage(
                message,
                `Issue RR-${id} loaded successfully.`,
                true
            );

        } catch (error) {
            if (result) result.hidden = true;
            resetEvidenceDisplay();
            console.error("Track issue error:", error);

            showMessage(
                message,
                error.message ||
                    "Unable to find this Report ID. Check the ID and try again.",
                false
            );
        }
    });
}

/* STATUS TIMELINE */

function updateTimeline(status) {
    const normalized = String(status || "Reported").toLowerCase();

    const activeIndex = normalized.includes("closed") ? 4
        : normalized.includes("resolved") ? 3
        : normalized.includes("maintenance") ? 2
        : (
            normalized.includes("assigned") ||
            normalized.includes("inspection")
        ) ? 1 : 0;

    const ids = [
        "timelineReported",
        "timelineAssigned",
        "timelineMaintenance",
        "timelineResolved",
        "timelineClosed"
    ];

    ids.forEach((id, index) => {
        const element = document.getElementById(id);
        if (!element) return;

        element.classList.remove("completed", "active");

        if (index < activeIndex) {
            element.classList.add("completed");
        }

        if (index === activeIndex) {
            element.classList.add("active", "completed");
        }
    });

    const timeline = document.getElementById("issueTimeline");

    if (timeline) {
        const items = Array.from(
            timeline.querySelectorAll(".timeline-item")
        );

        items.forEach((element, index) => {
            element.classList.remove("completed", "active");

            if (index < activeIndex) {
                element.classList.add("completed");
            }

            if (index === activeIndex) {
                element.classList.add("active", "completed");
            }
        });
    }
}

/* BEFORE/AFTER PHOTO PREVIEW */

function setupEvidenceControls() {
    const pairs = [
        [
            "beforeCamera",
            "beforeGallery",
            "beforePhotoDisplay",
            "beforeEvidenceStatus"
        ],
        [
            "afterCamera",
            "afterGallery",
            "afterPhotoDisplay",
            "afterEvidenceStatus"
        ]
    ];

    pairs.forEach(([cameraId, galleryId, imageId, statusId]) => {
        [cameraId, galleryId].forEach(inputId => {
            const input = document.getElementById(inputId);
            if (!input) return;

            input.addEventListener("change", function () {
                const file = this.files && this.files[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                    showMessage(
                        document.getElementById(statusId),
                        "Please choose an image file.",
                        false
                    );
                    this.value = "";
                    return;
                }

                const image = document.getElementById(imageId);
                const status = document.getElementById(statusId);

                if (image) {
                    image.src = URL.createObjectURL(file);
                    image.style.display = "block";
                }

                if (status) {
                    status.textContent = `Selected: ${file.name}`;
                }
            });
        });
    });

    const uploadButton = document.getElementById("uploadEvidenceBtn");

    if (uploadButton) {
        uploadButton.addEventListener("click", uploadEvidence);
    }
}

async function uploadEvidence() {
    const reportInput = document.getElementById("reportId");
    const message =
        document.getElementById("evidenceMessage") ||
        document.getElementById("message");

    const reportId = normalizeReportId(reportInput?.value);

    if (!reportId) {
        showMessage(
            message,
            "Enter a valid Report ID before uploading photos.",
            false
        );
        return;
    }

    const beforeFile =
        document.getElementById("beforeCamera")?.files?.[0] ||
        document.getElementById("beforeGallery")?.files?.[0];

    const afterFile =
        document.getElementById("afterCamera")?.files?.[0] ||
        document.getElementById("afterGallery")?.files?.[0];

    if (!beforeFile && !afterFile) {
        showMessage(
            message,
            "Choose a before photo or an after photo first.",
            false
        );
        return;
    }

    const formData = new FormData();
    formData.append("reportId", reportId);

    if (beforeFile) formData.append("beforePhoto", beforeFile);
    if (afterFile) formData.append("afterPhoto", afterFile);

    try {
        const response = await fetch(`${API_BASE}/api/evidence/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Upload failed (${response.status})`);
        }

        showMessage(message, "Evidence photos uploaded successfully.", true);
        await loadEvidence(reportId);

    } catch (error) {
        console.error("Evidence upload error:", error);
        showMessage(
            message,
            error.message || "Unable to upload photos. Please try again.",
            false
        );
    }
}

async function loadEvidence(reportId) {
    const beforeImage = document.getElementById("beforePhotoDisplay");
    const afterImage = document.getElementById("afterPhotoDisplay");
    const beforeStatus = document.getElementById("beforeEvidenceStatus");
    const afterStatus = document.getElementById("afterEvidenceStatus");

    try {
        const response = await fetch(
            `${API_BASE}/api/evidence/${encodeURIComponent(reportId)}`
        );

        if (response.status === 204 || response.status === 404) {
            resetEvidenceDisplay();
            return;
        }

        if (!response.ok) {
            throw new Error(`Evidence lookup failed (${response.status})`);
        }

        const evidence = await response.json();

        if (evidence.beforePhoto) {
            if (beforeImage) {
                beforeImage.src = evidence.beforePhoto;
                beforeImage.style.display = "block";
            }
            if (beforeStatus) beforeStatus.textContent = "Before photo saved.";
        } else {
            if (beforeImage) {
                beforeImage.removeAttribute("src");
                beforeImage.style.display = "none";
            }
            if (beforeStatus) beforeStatus.textContent = "No before photo saved.";
        }

        if (evidence.afterPhoto) {
            if (afterImage) {
                afterImage.src = evidence.afterPhoto;
                afterImage.style.display = "block";
            }
            if (afterStatus) afterStatus.textContent = "After photo saved.";
        } else {
            if (afterImage) {
                afterImage.removeAttribute("src");
                afterImage.style.display = "none";
            }
            if (afterStatus) afterStatus.textContent = "No after photo saved.";
        }

    } catch (error) {
        console.error("Evidence loading error:", error);
    }
}

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

    if (beforeStatus) beforeStatus.textContent = "No before photo loaded.";
    if (afterStatus) afterStatus.textContent = "No after photo loaded.";
}

/* REPORT PHOTO FILE NAMES */

function setupPhotoNames() {
    [
        ["issuePhotoCamera", "photoName"],
        ["issuePhotoGallery", "photoName"]
    ].forEach(([inputId, nameId]) => {
        const input = document.getElementById(inputId);
        const display = document.getElementById(nameId);

        if (!input || !display) return;

        input.addEventListener("change", function () {
            display.textContent =
                this.files && this.files.length
                    ? this.files[0].name
                    : "";
        });
    });
}

/* DASHBOARD ISSUE TABLE */

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

        if (!Array.isArray(issues) || !issues.length) {
            table.innerHTML =
                '<tr><td colspan="6">No issues reported yet.</td></tr>';
            return;
        }

        issues.forEach(issue => {
            const id = issue.reportId ?? issue.id;
            const row = document.createElement("tr");

            [
                `RR-${id}`,
                `${issue.station || "-"} — Platform ${issue.platform ?? "-"}`,
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

            link.href =
                `issue-details.html?id=RR-${encodeURIComponent(id)}`;
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

/* DASHBOARD STATISTICS */

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

        const cards = document.querySelectorAll(
            ".dashboard-cards .card h2"
        );

        if (cards.length >= 4) {
            [total, requiresAction, underMaintenance, resolved]
                .forEach((value, index) => {
                    cards[index].textContent = value;
                });
        }

    } catch (error) {
        console.error("Dashboard statistics error:", error);
    }
}

/* ISSUE DETAILS PAGE */

async function loadIssueDetails() {
    const reportIdElement = document.getElementById("detailReportId");
    if (!reportIdElement) return;

    const params = new URLSearchParams(window.location.search);
    const reportId = normalizeReportId(params.get("id"));

    if (!reportId) return;

    try {
        const response = await fetch(
            `${API_BASE}/api/issues/${encodeURIComponent(reportId)}`
        );

        if (!response.ok) {
            throw new Error(`Issue not found (${response.status})`);
        }

        const issue = await response.json();
        const id = issue.reportId ?? issue.id;

        setText("detailReportId", `RR-${id}`);
        setText("detailStation", issue.station);
        setText("detailPlatform", `Platform ${issue.platform}`);
        setText("detailIssueType", issue.issueType);
        setText("detailIssue", issue.issueType);
        setText("detailStatus", issue.status || "Reported");
        setText("detailReportedIssue", issue.description || issue.issueType);
        setText(
            "detailLocation",
            `${issue.station || "-"} — Platform ${issue.platform ?? "-"}`
        );
        setText("detailReportStatus", issue.status || "Reported");
        setText("detailPriority", issue.priority || "Medium");
        setText("detailSeverity", issue.priority || "Medium");

        const select = document.getElementById("issueStatus");
        if (select) select.value = issue.status || "Reported";

    } catch (error) {
        console.error("Issue details error:", error);
    }
}

/* UPDATE ISSUE STATUS */

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
                `${API_BASE}/api/issues/${encodeURIComponent(reportId)}` +
                `/status?status=${encodeURIComponent(select.value)}`,
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
