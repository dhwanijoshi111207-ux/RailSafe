package com.railsafe.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "evidence")
public class Evidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer evidenceId;

    private Integer reportId;

    private String beforePhoto;

    private String afterPhoto;

    public Integer getEvidenceId() {
        return evidenceId;
    }

    public void setEvidenceId(Integer evidenceId) {
        this.evidenceId = evidenceId;
    }

    public Integer getReportId() {
        return reportId;
    }

    public void setReportId(Integer reportId) {
        this.reportId = reportId;
    }

    public String getBeforePhoto() {
        return beforePhoto;
    }

    public void setBeforePhoto(String beforePhoto) {
        this.beforePhoto = beforePhoto;
    }

    public String getAfterPhoto() {
        return afterPhoto;
    }

    public void setAfterPhoto(String afterPhoto) {
        this.afterPhoto = afterPhoto;
    }
}
