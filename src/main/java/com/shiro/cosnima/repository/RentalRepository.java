package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.OfferStatus;
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

    @Query("""
SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
FROM Rental r
WHERE r.listing.id = :listingId
AND r.status = com.shiro.cosnima.model.RentalStatus.APPROVED
AND (
    :start <= r.endDate AND :end >= r.startDate
)
""")
    boolean existsOverlap(
            String listingId,
            LocalDate start,
            LocalDate end
    );


    @Query("SELECT r FROM Rental r WHERE r.renter.id = :userId OR r.listing.seller.id = :userId AND r.listing.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED ORDER BY r.startDate DESC")
    List<Rental> findUserRentalHistory(@Param("userId") UUID userId);

    long countByStatus(RentalStatus status);

    Rental findByRenterIdAndListingId(UUID userId, String listingId);

    @Query("SELECT r FROM Rental r JOIN FETCH r.listing l WHERE r.renter.id = :userId AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED")
    List<Rental> findByRenterId(@Param("userId") UUID userId);

    @Query("SELECT r FROM Rental r JOIN FETCH r.listing l WHERE r.renter.id = :userId AND r.status = :status AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED")
    List<Rental> findByRenterIdAndStatus(@Param("userId") UUID userId, @Param("status") RentalStatus status);

    @Query("""
SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END
FROM Rental r
WHERE r.listing.id = :listingId
AND r.status = com.shiro.cosnima.model.RentalStatus.APPROVED
AND :today BETWEEN r.startDate AND r.endDate
""")
    boolean existsActiveRentals(
            @Param("listingId") String listingId,
            @Param("today") LocalDate today
    );


    Rental findByListingId(String listingId);

    @Query("SELECT r FROM Rental r JOIN FETCH r.listing l JOIN FETCH r.renter WHERE l.seller.id = :userId AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED")
    List<Rental> findRequestsBySellerId(@Param("userId") UUID userId);

    @Query("SELECT r FROM Rental r WHERE r.listing.id = :listingId AND r.status IN ('APPROVED', 'ACTIVE') AND (r.startDate <= :endDate AND r.endDate >= :startDate)")
    List<Rental> findConflictingRentals(@Param("listingId") String listingId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM Rental r JOIN FETCH r.listing l WHERE l.seller.id = :userId AND r.status = :status AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED")
    List<Rental> findByListingSellerIdAndStatus(@Param("userId") UUID userId, @Param("status") RentalStatus status);
}
