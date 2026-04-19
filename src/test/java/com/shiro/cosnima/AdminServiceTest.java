package com.shiro.cosnima;

import com.shiro.cosnima.dto.response.AdminStatsResponse;
import com.shiro.cosnima.model.*;
import com.shiro.cosnima.repository.*;
import com.shiro.cosnima.service.AdminService;
import com.shiro.cosnima.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private ListingRepository listingRepo;

    @Mock
    private RentalRepository rentalRepo;

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private MessageRepository messageRepo;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private AdminService adminService;

    private User testUser;
    private Listing testListing;
    private Report testReport;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setUsername("testuser");
        testUser.setEmail("test@test.com");
        testUser.setRole(User.Role.USER);
        testUser.setCreatedAt(LocalDateTime.now());

        testListing = new Listing();
        testListing.setId("listing-123");
        testListing.setTitle("Test Listing");
        testListing.setPrice(new java.math.BigDecimal("100.00"));
        testListing.setSeller(testUser);
        testListing.setStatus(Listing.Status.AVAILABLE);
        testListing.setIsActive(true);

        testReport = new Report();
        testReport.setId("");
        testReport.setReporter(testUser);
        testReport.setTargetType(Report.TargetType.USER);
        testReport.setTargetId("target-123");
        testReport.setReason(Report.Reason.SCAM);
        testReport.setStatus(Report.Status.PENDING);
        testReport.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testGetStats_returnsValidStats() {
        // Given
        when(userRepo.count()).thenReturn(10L);
        when(userRepo.countByCreatedAtBetween(any(), any())).thenReturn(2L);
        when(userRepo.countByIsActive(true)).thenReturn(5L);
        when(userRepo.countByIsBannedTrue()).thenReturn(1L);

        when(listingRepo.count()).thenReturn(20L);
        when(listingRepo.countByIsActive(true)).thenReturn(15L);
        when(listingRepo.countByStatus(Listing.Status.SOLD)).thenReturn(5L);
        when(listingRepo.countByStatus(Listing.Status.PENDING)).thenReturn(2L);

        when(rentalRepo.count()).thenReturn(8L);
        when(rentalRepo.countByStatus(RentalStatus.ACTIVE)).thenReturn(3L);
        when(rentalRepo.countByStatus(RentalStatus.COMPLETED)).thenReturn(5L);

        when(messageRepo.count()).thenReturn(50L);
        when(messageRepo.countByIsReadFalse()).thenReturn(10L);

        when(reportRepository.countByStatus(Report.Status.PENDING)).thenReturn(3L);
        when(reportRepository.countByStatus(Report.Status.RESOLVED)).thenReturn(7L);

        // When
        AdminStatsResponse stats = adminService.getStats();

        // Then
        assertNotNull(stats);
        assertEquals(10, stats.getTotalUsers());
        assertEquals(2, stats.getNewUsersToday());
        assertEquals(1, stats.getBannedUsers());
        assertEquals(20, stats.getTotalListings());
        assertEquals(15, stats.getActiveListings());
        assertEquals(5, stats.getSoldListings());
        assertEquals(2, stats.getPendingListings());
        assertEquals(8, stats.getTotalRentals());
        assertEquals(3, stats.getActiveRentals());
        assertEquals(5, stats.getCompletedRentals());
        assertEquals(50, stats.getTotalMessages());
        assertEquals(10, stats.getUnreadMessages());
        assertEquals(3, stats.getPendingReports());
        assertEquals(7, stats.getResolvedReports());
    }

    @Test
    void testGetUsers_returnsPage() {
        // Given
        Page<User> userPage = new PageImpl<>(List.of(testUser));
        when(userRepo.findAll(any(Pageable.class))).thenReturn(userPage);

        // When
        Page<?> result = adminService.getUsers(Pageable.unpaged());

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(userRepo, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void testGetListings_returnsPage() {
        // Given
        Page<Listing> listingPage = new PageImpl<>(List.of(testListing));
        when(listingRepo.findAll(any(Pageable.class))).thenReturn(listingPage);

        // When
        Page<?> result = adminService.getListings(Pageable.unpaged());

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testGetReports_returnsPage() {
        // Given
        Page<Report> reportPage = new PageImpl<>(List.of(testReport));
        when(reportRepository.findAllWithUsers(any(Pageable.class))).thenReturn(reportPage);

        // When
        Page<?> result = adminService.getReports(Pageable.unpaged());

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testBanUser_setsUserBanned() {
        // Given
        when(userRepo.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepo.save(any(User.class))).thenReturn(testUser);

        // When
        adminService.banUser(testUser.getId(), "SCAM");

        // Then
        verify(userRepo, times(1)).save(any(User.class));
    }

    @Test
    void testUnbanUser_clearsBan() {
        // Given
        testUser.setIsBanned(true);
        when(userRepo.findById(testUser.getId())).thenReturn(Optional.of(testUser));
        when(userRepo.save(any(User.class))).thenReturn(testUser);

        // When
        adminService.unbanUser(testUser.getId());

        // Then
        verify(userRepo, times(1)).save(any(User.class));
    }
}