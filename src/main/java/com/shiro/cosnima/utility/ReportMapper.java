package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.request.ReportRequest;
import com.shiro.cosnima.dto.response.ReportResponse;
import com.shiro.cosnima.model.Report;
import com.shiro.cosnima.model.User;

import java.util.UUID;

public class ReportMapper {

    // ===== ENTITY → DTO =====
    public static ReportResponse toDto(Report report) {
        if (report == null) return null;

        ReportResponse dto = new ReportResponse();

        dto.setId(report.getId());

        if (report.getReporter() != null) {
            dto.setReporterId(report.getReporter().getId().toString());
        }

        if (report.getReviewedBy() != null) {
            dto.setReviewedBy(report.getReviewedBy().getId().toString());
        }

        dto.setTargetType(
                report.getTargetType() != null ? report.getTargetType().name() : null
        );

        dto.setTargetId(report.getTargetId());

        dto.setReason(
                report.getReason() != null ? report.getReason().name() : null
        );

        dto.setDescription(report.getDescription());

        dto.setStatus(
                report.getStatus() != null ? report.getStatus().name() : null
        );

        dto.setAdminNote(report.getAdminNote());
        dto.setCreatedAt(report.getCreatedAt().toString());
        dto.setResolvedAt(report.getResolvedAt() != null ? report.getResolvedAt().toString() : null);

        return dto;
    }

}
