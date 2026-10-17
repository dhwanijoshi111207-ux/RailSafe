package com.railsafe.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "maintenance")
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer maintenanceId;

    private Integer reportId;

    private String assignedTeam;

    private String assignedOfficer;

    private String maintenanceStatus;

    private java.time.LocalDateTime startedAt;

    private java.time.LocalDateTime completedAt;

    public Integer getMaintenanceId() {
        return maintenanceId;
    }

    public void setMaintenanceId(Integer maintenanceId) {
        this.maintenanceId = maintenanceId;
    }

    public Integer getReportId() {
        return reportId;
    }

    public void setReportId(Integer reportId) {
        this.reportId = reportId;
    }

    public String getAssignedTeam() {
        return assignedTeam;
    }

    public void setAssignedTeam(String assignedTeam) {
        this.assignedTeam = assignedTeam;
    }

    public String getAssignedOfficer() {
        return assignedOfficer;
    }

    public void setAssignedOfficer(String assignedOfficer) {
        this.assignedOfficer = assignedOfficer;
    }

    public String getMaintenanceStatus() {
        return maintenanceStatus;
    }

    public void setMaintenanceStatus(String maintenanceStatus) {
        this.maintenanceStatus = maintenanceStatus;
    }

    public java.time.LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(java.time.LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public java.time.LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(java.time.LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}