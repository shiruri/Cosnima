package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.ListingImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, String> {



    // =========================
    // SELLER LISTINGS
    // =========================
    @Query("""
        SELECT l FROM Listing l
        WHERE l.seller.id = :sellerId
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    List<Listing> findBySellerId(@Param("sellerId") UUID sellerId);

    Optional<Listing> findFirstBySeller_Id(UUID sellerId);

    // =========================
    // COUNTS
    // =========================
    long countByStatus(Listing.Status status);

    long countByIsActive(Boolean isActive);

    @Query("""
        SELECT COUNT(l)
        FROM Listing l
        WHERE l.status = com.shiro.cosnima.model.Listing.Status.AVAILABLE
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    long countAllListings();

    @Query("""
        SELECT COUNT(DISTINCT l.seller.id)
        FROM Listing l
        WHERE l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    UUID countDistinctSellers();

    // =========================
    // BASIC FETCH (SAFE VERSION)
    // =========================
    @Query("""
        SELECT l FROM Listing l
        WHERE l.id = :id
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    List<Listing> getListingsById(@Param("id") String id);

    @Query("""
        SELECT l FROM Listing l
        LEFT JOIN FETCH l.images
        LEFT JOIN FETCH l.seller
        WHERE l.id = :id
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    Optional<Listing> findByIdWithImages(@Param("id") String id);

    // =========================
    // IMAGES
    // =========================
    @Query("""
        SELECT li FROM ListingImage li
        WHERE li.listing.id IN :listingIds
    """)
    List<ListingImage> findImagesByListingIds(@Param("listingIds") List<String> listingIds);

    // =========================
    // VIEW COUNT
    // =========================
    @Modifying
    @Query("""
        UPDATE Listing l
        SET l.viewCount = l.viewCount + 1
        WHERE l.id = :listingId
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    int incrementViewCount(@Param("listingId") String listingId);

    // =========================
    // MAIN LISTING SEARCH (FULL FILTER)
    // =========================
    @Query("""
        SELECT l FROM Listing l
        WHERE (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:minPrice IS NULL OR l.price >= :minPrice)
        AND (:maxPrice IS NULL OR l.price <= :maxPrice)
        AND (:condition IS NULL OR l.condition = :condition)
        AND (:isActive IS NULL OR l.isActive = :isActive)
        AND (:status IS NULL OR l.status = :status)
        AND (:type IS NULL OR l.type = :type)
        AND (:size IS NULL OR l.size = :size)
        AND (:series IS NULL OR LOWER(l.seriesName) LIKE LOWER(CONCAT('%', :series, '%')))
        AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED
    """)
    Page<Listing> getListings(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("condition") Listing.Condition condition,
            @Param("isActive") Boolean isActive,
            @Param("status") Listing.Status status,
            @Param("type") Listing.Type type,
            @Param("size") String size,
            @Param("series") String series,
            Pageable pageable
    );

    // =========================
    // OPTIONAL SAFETY OVERRIDE (prevents accidental use)
    // =========================
    @Override
    Optional<Listing> findById(String id);
}
