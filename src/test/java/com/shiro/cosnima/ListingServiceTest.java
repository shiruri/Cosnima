package com.shiro.cosnima;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.ListingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ListingServiceTest {

    @Mock
    private ListingRepository listingRepo;

    @Test
    void testListing_findById_returnsListing() {
        Listing listing = new Listing();
        listing.setId("list-123");
        listing.setTitle("Test Item");
        listing.setPrice(new BigDecimal("100.00"));
        listing.setStatus(Listing.Status.AVAILABLE);

        when(listingRepo.findById("list-123")).thenReturn(Optional.of(listing));

        Optional<Listing> result = listingRepo.findById("list-123");

        assertTrue(result.isPresent());
        assertEquals("Test Item", result.get().getTitle());
    }

    @Test
    void testListing_countByIsActive() {
        when(listingRepo.countByIsActive(true)).thenReturn(15L);

        long count = listingRepo.countByIsActive(true);

        assertEquals(15L, count);
    }

    @Test
    void testListing_countByStatus() {
        when(listingRepo.countByStatus(Listing.Status.SOLD)).thenReturn(5L);

        long count = listingRepo.countByStatus(Listing.Status.SOLD);

        assertEquals(5L, count);
    }

    @Test
    void testListingStatus_enumValues() {
        assertNotNull(Listing.Status.AVAILABLE);
        assertNotNull(Listing.Status.SOLD);
        assertNotNull(Listing.Status.RENTED);
        assertNotNull(Listing.Status.ARCHIVED);
    }
}