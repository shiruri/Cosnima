package com.shiro.cosnima.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReportResponse {

    private String id;  // Keep as String - JSON number coercion safe

    private String reporterId;
    private String reporterName;
    private String reviewedBy;

    private String targetType;
    private String targetId;

    private String reason;
    private String description;

    private String status;
    private String adminNote;

    private String createdAt;
    private String resolvedAt;

    // ===== GETTERS & SETTERS =====

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String id) { this.reporterId = id; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String n) { this.reporterName = n; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String id) { this.reviewedBy = id; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String t) { this.targetType = t; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String id) { this.targetId = id; }

    public String getReason() { return reason; }
    public void setReason(String r) { this.reason = r; }

    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }

    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }

    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String n) { this.adminNote = n; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String d) { this.createdAt = d; }

    public String getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(String d) { this.resolvedAt = d; }
}
