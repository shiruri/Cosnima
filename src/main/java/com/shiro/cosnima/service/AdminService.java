package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.request.AdminReviewReportRequest;
import com.shiro.cosnima.dto.request.ImageUpdateMode;
import com.shiro.cosnima.dto.request.UpdateListingRequest;
import com.shiro.cosnima.dto.request.UserDto;
import com.shiro.cosnima.dto.response.*;
import com.shiro.cosnima.model.ApiException;
import com.shiro.cosnima.model.*;
import com.shiro.cosnima.repository.*;
import com.shiro.cosnima.utility.AdminListingMapper;
import com.shiro.cosnima.utility.ListingMapper;
import com.shiro.cosnima.utility.RentalMapper;
import com.shiro.cosnima.utility.ReportMapper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Transactional
@Service
public class AdminService {

    private final UserRepository userRepo;
    private final ReportRepository reportRepo;
    private final ListingRepository listingRepo;
    private final RentalRepository rentalRepo;
    private final MessageRepository messageRepo;
    private final CloudinaryService cloudinaryService;

    public AdminService(UserRepository userRepo  , ListingRepository listingRepo, RentalRepository rentalRepo, ReportRepository reportRepo, MessageRepository messageRepo, CloudinaryService cloudinaryService) {
        this.userRepo = userRepo;
        this.listingRepo = listingRepo;
        this.rentalRepo = rentalRepo;
        this.reportRepo = reportRepo;
        this.messageRepo = messageRepo;
        this.cloudinaryService = cloudinaryService;
    }

    public Page<UserDto> getUsers(Pageable pageable) {
        return userRepo.findAll(pageable)
                .map(UserDto::fromEntity);
    }


    public AdminStatsResponse getStats() {
        AdminStatsResponse stats = new AdminStatsResponse();

        long userCount = userRepo.count();
        stats.setTotalUsers(userCount);

        LocalDate today = LocalDate.now();
        long newUserCount = userRepo.countByCreatedAtBetween(today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        stats.setNewUsersToday(newUserCount);

        long onlineUserCount = userRepo.countByIsActive(true);
        stats.setActiveUsers(onlineUserCount);

        long listingCount = listingRepo.count();
        stats.setTotalListings(listingCount);

        long activeListingCount = listingRepo.countByIsActive(true);
        stats.setActiveListings(activeListingCount);

        long soldListingCount = listingRepo.countByStatus(Listing.Status.SOLD);
        stats.setSoldListings(soldListingCount);

        long rentalCount = rentalRepo.count();
        stats.setTotalRentals(rentalCount);

        long activeRentalCount = rentalRepo.countByStatus(RentalStatus.ACTIVE);
        stats.setActiveRentals(activeRentalCount);

        long completedRentalCount = rentalRepo.countByStatus(RentalStatus.COMPLETED);
        stats.setCompletedRentals(completedRentalCount);

        long messageCount = messageRepo.count();
        stats.setTotalMessages(messageCount);

        long unreadMessageCount = messageRepo.countByIsReadFalse();
        stats.setUnreadMessages(unreadMessageCount);

        // Reports
        long pendingReports = reportRepo.countByStatus(Report.Status.PENDING);
        stats.setPendingReports(pendingReports);
        long resolvedReports = reportRepo.countByStatus(Report.Status.RESOLVED);
        stats.setResolvedReports(resolvedReports);

        // Banned users
        long bannedUsers = userRepo.countByIsBannedTrue();
        stats.setBannedUsers(bannedUsers);

        // Pending listings (not yet approved)
        long pendingListings = listingRepo.countByStatus(Listing.Status.PENDING);
        stats.setPendingListings(pendingListings);

        return stats;

    }

    public AdminUserDetailResponse getUserDetail(UUID userId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Listing> listings = listingRepo.findBySellerId(userId);
        List<Rental> rentals = rentalRepo.findUserRentalHistory(userId);

        AdminUserDetailResponse res = new AdminUserDetailResponse();

        // ── Basic Info ──
        res.setId(user.getId());
        res.setUsername(user.getUsername());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole().name());
        res.setCreatedAt(user.getCreatedAt());

        // ── Counts ──
        res.setTotalListings(listings.size());
        res.setTotalRentals(rentals.size());

        // ── History ──
        res.setListings(
                listings.stream().map(ListingMapper::toDto).toList()
        );

        res.setRentals(
                rentals.stream().map(RentalMapper::toDto).toList()
        );

        return res;
    }

    public UserDto banUser(UUID userId, String banReason) {
        User user = userRepo.findUserById(userId).orElseThrow();

        if(user.getIsBanned() == true) {
            throw ApiException.conflict("user is already Banned");
        }
        user.setIsBanned(true);
        user.setBanReason(banReason);
        User saved = userRepo.save(user);
        return UserDto.fromEntity(saved);
    }

    public UserDto unbanUser(UUID userId) {
        User user = userRepo.findUserById(userId).orElseThrow();
        if(user.getIsBanned() == false) {
            throw ApiException.badRequest("user is not Banned");

        }
        user.setIsBanned(false);
        User saved = userRepo.save(user);
        return UserDto.fromEntity(saved);


    }

    public Page<AdminListingResponse> getListings(Pageable pageable) {
        return listingRepo.findAll(pageable)
                .map(AdminListingMapper::toDto);
    }

    public ListingResponse updateStatus(String id, String status) throws AccessDeniedException {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));



        listing.setStatus(Listing.Status.valueOf(status.toUpperCase()));

        Listing saved = listingRepo.save(listing);

        return ListingMapper.toDto(saved);
    }


    public ListingResponse updateListing(
            String id,
            UpdateListingRequest request,
            List<MultipartFile> files
    ) throws IOException {

        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));


        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getDescription() != null) listing.setDescription(request.getDescription());
        if (request.getPrice() != null) listing.setPrice(request.getPrice());
        if (request.getType() != null) listing.setType(Listing.Type.valueOf(request.getType()));
        if (request.getCondition() != null) listing.setCondition(Listing.Condition.valueOf(request.getCondition()));
        if (request.getSize() != null) listing.setSize(request.getSize());
        if (request.getCharacterName() != null) listing.setCharacterName(request.getCharacterName());
        if (request.getSeriesName() != null) listing.setSeriesName(request.getSeriesName());
        if (request.getLocation() != null) listing.setLocation(request.getLocation());
        if (request.getConventionPickup() != null)
            listing.setConventionPickup(request.getConventionPickup());

        // =====================================================
        // 4. IMAGE LOGIC (FULL FIX)
        // =====================================================
        if (files != null && !files.isEmpty()) {

            ImageUpdateMode mode = request.getImageMode();

            // DEFAULT SAFETY: ADD
            if (mode == null) mode = ImageUpdateMode.ADD;

            // -----------------------------------------------------
            // REPLACE MODE
            // -----------------------------------------------------
            if (mode == ImageUpdateMode.REPLACE) {

                // delete old cloudinary images
                for (ListingImage img : listing.getImages()) {
                    if (img.getPublicId() != null) {
                        cloudinaryService.deleteImage(img.getPublicId());
                    }
                }

                listing.getImages().clear();
            }

            // -----------------------------------------------------
            // ADD MODE (or after replace)
            // -----------------------------------------------------
            for (MultipartFile file : files) {

                Map uploadResult =
                        cloudinaryService.uploadImage(file, "listing_images");

                ListingImage img = new ListingImage();
                img.setImageUrl(uploadResult.get("secure_url").toString());
                img.setPublicId(uploadResult.get("public_id").toString());
                img.setIsPrimary(false);
                img.setSortOrder(listing.getImages().size());
                img.setListing(listing);

                listing.getImages().add(img);
            }
        }


        // 5. SAVE
        Listing saved = listingRepo.save(listing);

        // 6. MAP RESPONSE
        ListingResponse dto = ListingMapper.toDto(saved);

        boolean isOwner = true;
        dto.setIsOwner(isOwner);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        return dto;
    }

    public void deleteListing(String id) {
        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        listingRepo.deleteById(id);


    }
    @Transactional
    public Page<ReportResponse> getReports(Pageable pageable) {
        return reportRepo.findAllWithUsers(pageable).map(ReportMapper::toDto);
    }

    public ReportResponse reviewReport(String idStr, AdminReviewReportRequest request, String adminUsername) {
        Report report = reportRepo.findByIdString(idStr)
                .orElseThrow(() -> ApiException.notFound("Report not found"));

        // Guard: don't allow re-reviewing closed reports
        if (report.getStatus() == Report.Status.RESOLVED ||
                report.getStatus() == Report.Status.REJECTED) {
            throw ApiException.badRequest("Report is already closed.");
        }

        // Parse status safely from String if your DTO holds a String
        Report.Status newStatus =
                request.getStatus();


        report.setStatus(newStatus);
        report.setAdminNote(request.getAdminNote());

        // Set resolvedAt when closing
        if (newStatus == Report.Status.RESOLVED || newStatus == Report.Status.REJECTED) {
            report.setResolvedAt(LocalDateTime.now());
        }

        // Resolve admin from username — never trust a UUID from the request body
        if (adminUsername != null) {
            userRepo.findById(UUID.fromString(adminUsername)).ifPresent(report::setReviewedBy);
        }

        return ReportMapper.toDto(reportRepo.save(report));
    }

}






