package com.shiro.cosnima;

import com.shiro.cosnima.model.*;
import com.shiro.cosnima.dto.request.UserLoginDto;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ModelUnitTest {

    @Test
    void testUserModel() {
        UUID id = UUID.randomUUID();
        User user = new User();
        user.setId(id);
        user.setUsername("testuser");
        user.setEmail("test@test.com");
        user.setRole(User.Role.USER);

        assertEquals(id, user.getId());
        assertEquals("testuser", user.getUsername());
        assertEquals("test@test.com", user.getEmail());
    }

    @Test
    void testUserDefaults() {
        User user = new User();
        assertNotNull(user.getCreatedAt());
        assertTrue(user.getIsActive());
    }

    @Test
    void testListingModel() {
        Listing listing = new Listing();
        listing.setId("list-1");
        listing.setTitle("Test");
        listing.setPrice(new BigDecimal("100"));
        listing.setStatus(Listing.Status.AVAILABLE);

        assertEquals("list-1", listing.getId());
        assertEquals(Listing.Status.AVAILABLE, listing.getStatus());
    }

    @Test
    void testReportModel() {
        Report report = new Report();
        report.setId("UUID.randomUUID()");
        report.setTargetType(Report.TargetType.USER);
        report.setTargetId("t1");
        report.setReason(Report.Reason.SCAM);
        report.setStatus(Report.Status.PENDING);

        assertEquals(Report.TargetType.USER, report.getTargetType());
        assertEquals(Report.Reason.SCAM, report.getReason());
    }

    @Test
    void testUserLoginDto() {
        UserLoginDto dto = new UserLoginDto();
        dto.setLogin("a@b.com");
        dto.setPassword("pass");

        assertEquals("a@b.com", dto.getLogin());
    }
}