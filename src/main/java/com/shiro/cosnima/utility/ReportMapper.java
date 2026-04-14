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
            dto.setReporterId(report.getReporter().getId()); // UUID
        }

        if (report.getReviewedBy() != null) {
            dto.setReviewedBy(report.getReviewedBy().getId()); // UUID
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
        dto.setCreatedAt(report.getCreatedAt());
        dto.setResolvedAt(report.getResolvedAt());

        return dto;
    }

    // ===== REQUEST → ENTITY =====
    public static Report fromDto(ReportRequest dto, Report report, User reporter) {
        if (dto == null || report == null) return null;

        report.setReporter(reporter); // UUID user

        report.setTargetType(
                Report.TargetType.valueOf(dto.getTargetType().toUpperCase())
        );

        report.setTargetId(dto.getTargetId());

        report.setReason(
                Report.Reason.valueOf(dto.getReason().toUpperCase())
        );

        report.setDescription(dto.getDescription());

        return report;
    }
}
