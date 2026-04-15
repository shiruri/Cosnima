package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Rental;
import com.shiro.cosnima.model.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
@Repository

public interface RentalRepository extends JpaRepository<Rental, Long> {

    Rental findByRenterIdAndListingId(UUID userId, String listingId);

    // ─────────────────────────────
    // RENTER SIDE (my rentals)
    // ─────────────────────────────
    List<Rental> findByRenterId(UUID userId);

    List<Rental> findByRenterIdAndStatus(UUID userId, RentalStatus status);

    Rental findByListingId(String listingId);
    // ─────────────────────────────
    // SELLER SIDE (requests on my listings)
    // ─────────────────────────────
    @Query("""
        SELECT r FROM Rental r
        JOIN FETCH r.listing l
        JOIN FETCH r.renter
        WHERE l.seller.id = :userId
    """)
    List<Rental> findRequestsBySellerId(@Param("userId") UUID userId);

    @Query("""
SELECT r FROM Rental r
WHERE r.listing.id = :listingId
AND r.status IN ('APPROVED', 'ACTIVE')
AND (
    r.startDate <= :endDate AND r.endDate >= :startDate
)
""")
    List<Rental> findConflictingRentals(
            @Param("listingId") String listingId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<Rental> findByListingSellerIdAndStatus(UUID userId, RentalStatus status);
}
