package com.shiro.cosnima.dto.request;

import com.shiro.cosnima.model.Report.Status;

import java.util.UUID;

public class AdminReviewReportRequest {

    // ── Admin action ──
    private Status status;        // RESOLVED / REJECTED / UNDER_REVIEW
    private String adminNote;     // optional note from admin

    // ── Optional moderation action target ──
    private boolean takeAction;   // e.g. ban user / hide listing / ignore

    private UUID reviewedBy;      // admin ID (optional if from auth context)

    // =========================
    // Getters & Setters
    // =========================

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }

    public boolean isTakeAction() {
        return takeAction;
    }

    public void setTakeAction(boolean takeAction) {
        this.takeAction = takeAction;
    }

    public UUID getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(UUID reviewedBy) {
        this.reviewedBy = reviewedBy;
    }
}
