package com.shiro.cosnima.dto.request;

import java.util.UUID;

public class ReportRequest {

    private String targetType; // USER, LISTING, MESSAGE
    private UUID targetId;

    private String reason; // SCAM, HARASSMENT, etc
    private String description;

    // ===== GETTERS & SETTERS =====

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public UUID getTargetId() {
        return targetId;
    }

    public void setTargetId(UUID targetId) {
        this.targetId = targetId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
