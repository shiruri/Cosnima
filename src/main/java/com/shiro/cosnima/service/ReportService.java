package com.shiro.cosnima.service;

import com.mysql.cj.xdevapi.Type;
import com.shiro.cosnima.dto.request.ReportRequest;
import com.shiro.cosnima.dto.response.ReportResponse;
import com.shiro.cosnima.model.Rating;
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


    public ReportResponse submitRating(UUID reporterId, ReportRequest request) {

        UUID targetId;
        try {
            targetId = UUID.fromString(request.getTargetId());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid target ID");
        }

        Report.TargetType type =
                Report.TargetType.valueOf(request.getTargetType().toUpperCase());

        Optional<Report> existingReport = reportRepo
                .findByReporter_IdAndTargetIdAndTargetType(
                        reporterId,
                        targetId,
                        type
                );

        if (existingReport.isPresent()) {
            throw new RuntimeException("You already reported this target.");
        }

        // ===== VALIDATE TARGET EXISTS =====
        switch (type) {

            case USER -> userRepo.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            case LISTING -> listingRepo.findById(targetId.toString())
                    .orElseThrow(() -> new RuntimeException("Listing not found"));

            case MESSAGE -> messageRepo.findById(targetId.toString())
                    .orElseThrow(() -> new RuntimeException("Message not found"));
        }

        Report report = new Report();

        report.setReporter(userRepo.findById(reporterId).orElseThrow());
        report.setTargetId(targetId.toString());
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
