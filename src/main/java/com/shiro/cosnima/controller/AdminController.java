package com.shiro.cosnima.controller;


import com.shiro.cosnima.dto.request.AdminReviewReportRequest;
import com.shiro.cosnima.dto.request.UpdateListingRequest;
import com.shiro.cosnima.dto.request.UserDto;
import com.shiro.cosnima.dto.response.*;
import com.shiro.cosnima.model.ApiException;
import com.shiro.cosnima.service.AdminService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminServ;

    public AdminController(AdminService adminServ) {
        this.adminServ = adminServ;
    }

    private void checkAdmin(Authentication auth) {
        if (auth == null ||
                !auth.isAuthenticated() ||
                "anonymousUser".equals(auth.getName())) {
            throw ApiException.forbidden("Unauthorized");
        }
    }

    @GetMapping("/users")
    public Page<UserDto> getsUsers(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.getUsers(pageable);
    }

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.getStats();
    }

    @GetMapping("/users/{id}")
    public AdminUserDetailResponse getUserDetail(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.getUserDetail(id);
    }

    @GetMapping("/listings")
    public Page<AdminListingResponse> getListings(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.getListings(pageable);
    }

    @PostMapping("/{id}/ban")
    public UserDto banUser(@PathVariable UUID id, String banReason) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.banUser(id,banReason);
    }

    @PostMapping("/{id}/unban")
    public UserDto unbanUser(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.unbanUser(id);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status
    ) throws AccessDeniedException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return ResponseEntity.ok(
                adminServ.updateStatus(id, status)
        );
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable String id,
            @RequestPart("value") UpdateListingRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        ListingResponse updated = adminServ.updateListing(id, request, files);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}") ResponseEntity<String> deleteListing(@PathVariable String id) throws IOException{
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        adminServ.deleteListing(id);
        return ResponseEntity.ok().body("Successfully Deleted");
    }

    @GetMapping("/reports")
    public Page<ReportResponse> getReports(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.getReports(pageable);
    }

    @PostMapping("/reports/{id}/review")
    public ReportResponse reviewReport( @PathVariable UUID id,
                                        @RequestBody AdminReviewReportRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        checkAdmin(auth);

        return adminServ.reviewReport(id,request);
    }

}






