package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.request.ReportRequest;
import com.shiro.cosnima.dto.response.ReportResponse;
import com.shiro.cosnima.model.ApiException;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Report;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.MessageRepository;
import com.shiro.cosnima.repository.ReportRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.utility.ReportMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ReportService {

    private final ReportRepository reportRepo;
    private final UserRepository userRepo;
    private final ListingRepository listingRepo;
    private final MessageRepository messageRepo;

    @Autowired
    public ReportService(ReportRepository reportRepo, UserRepository userRepo, ListingRepository listingRepo, MessageRepository messageRepo) {
        this.reportRepo = reportRepo;
        this.userRepo = userRepo;
        this.listingRepo = listingRepo;
        this.messageRepo = messageRepo;
    }


    public ReportResponse submitReport(UUID reporterId, ReportRequest request) {

        // ─────────────────────────────
        // 1. Parse target type
        // ─────────────────────────────
        Report.TargetType type =
                Report.TargetType.valueOf(request.getTargetType().toUpperCase());

        String targetId = request.getTargetId();

        // ─────────────────────────────
        // 2. Validate + normalize input
        // ─────────────────────────────
        switch (type) {

            case USER -> {
                // validate UUID format
                UUID.fromString(targetId);
            }

            case LISTING, MESSAGE -> {
                // no parsing needed (String IDs)
                if (targetId == null || targetId.isBlank()) {
                    throw ApiException.badRequest("Invalid target ID");
                }
            }
        }

        // ─────────────────────────────
        // 3. Check duplicate report
        // ─────────────────────────────
        Optional<Report> existingReport =
                reportRepo.findByReporter_IdAndTargetIdAndTargetType(
                        reporterId,
                        targetId,
                        type
                );

        if (existingReport.isPresent()) {
            throw ApiException.conflict("You already reported this target.");
        }

        // ─────────────────────────────
        // 4. Validate target exists
        // ─────────────────────────────
        switch (type) {

            case USER -> userRepo.findById(UUID.fromString(targetId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            case LISTING -> {
                Listing listing = listingRepo.findById(targetId)
                        .orElseThrow(() -> new RuntimeException("Listing not found"));
                if (listing.getStatus() == Listing.Status.ARCHIVED) {
                    throw ApiException.badRequest("This listing is no longer available");
                }
            }

            case MESSAGE -> messageRepo.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Message not found"));
        }

        // ─────────────────────────────
        // 5. Create report
        // ─────────────────────────────
        Report report = new Report();

        report.setReporter(
                userRepo.findById(reporterId)
                        .orElseThrow(() -> new RuntimeException("Reporter not found"))
        );

        report.setTargetId(targetId);
        report.setTargetType(type);
        report.setReason(Report.Reason.valueOf(request.getReason().toUpperCase()));
        report.setDescription(request.getDescription());

        Report saved = reportRepo.save(report);

        return ReportMapper.toDto(saved);
    }

    public List<ReportResponse> getUserReports(UUID userId) {
        return reportRepo.findByReporterId(userId).stream().map(ReportMapper::toDto).toList();
    }

}
