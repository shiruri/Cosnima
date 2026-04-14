package com.shiro.cosnima.controller;


import com.shiro.cosnima.dto.request.RatingRequest;
import com.shiro.cosnima.dto.request.ReportRequest;
import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.dto.response.ReportResponse;
import com.shiro.cosnima.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportServ;

    public ReportController(ReportService reportServ) {
        this.reportServ = reportServ;
    }

    @PostMapping()
    public ResponseEntity<ReportResponse> submitReport(@RequestBody @Valid ReportRequest reportReq,
                                                       BindingResult result) {
        if(!result.hasErrors()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    UUID reporterId = UUID.fromString(auth.getName());
                    ReportResponse report = reportServ.submitRating(reporterId,reportReq);
                    if(report != null) {
                        return ResponseEntity.ok().body(report);
                    }
                    return ResponseEntity.badRequest().build();
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(401).build();
                }
            }
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.badRequest().build();
    }


    @GetMapping("/mine")
    public ResponseEntity<List<ReportResponse>> getUserReports() {

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    UUID reporterId = UUID.fromString(auth.getName());
                    List<ReportResponse> reports = reportServ.getUserReports(reporterId);
                    if(reports != null) {
                        return ResponseEntity.ok().body(reports);
                    }
                    return ResponseEntity.badRequest().build();
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(401).build();
                }
            }
            return ResponseEntity.status(401).build();
        }

}
