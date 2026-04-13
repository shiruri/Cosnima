package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Offer;
import com.shiro.cosnima.model.OfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OffersRepository extends JpaRepository<Offer, UUID> {



    // Buyer: get own offers filtered by status
    @Query("""
        SELECT o FROM Offer o
        JOIN FETCH o.listing l
        LEFT JOIN FETCH l.images
        LEFT JOIN FETCH l.seller
        WHERE o.buyer.id = :buyerId
        AND o.status = :status
        ORDER BY o.createdAt DESC
    """)
    List<Offer> findByOfferStatus(
            @Param("buyerId") UUID buyerId,
            @Param("status") OfferStatus status
    );

    // Seller: get ALL offers on a listing regardless of status
    // FIXED: was findPendingByListingId which only returned PENDING,
    // causing accepted/rejected offers to vanish from the seller's panel.
    @Query("""
        SELECT o FROM Offer o
        JOIN FETCH o.listing l
        LEFT JOIN FETCH l.images
        LEFT JOIN FETCH l.seller
        WHERE o.listing.id = :listingId
        ORDER BY
            CASE o.status
                WHEN com.shiro.cosnima.model.OfferStatus.PENDING   THEN 0
                WHEN com.shiro.cosnima.model.OfferStatus.ACCEPTED   THEN 1
                WHEN com.shiro.cosnima.model.OfferStatus.REJECTED   THEN 2
                WHEN com.shiro.cosnima.model.OfferStatus.CANCELLED  THEN 3
                ELSE 4
            END,
            o.createdAt DESC
    """)
    List<Offer> findAllByListingId(@Param("listingId") String listingId);

    @Query("""
    SELECT o FROM Offer o
    JOIN FETCH o.listing l
    LEFT JOIN FETCH l.images
    LEFT JOIN FETCH l.seller
    LEFT JOIN FETCH o.buyer
    WHERE l.seller.id = :sellerId
    ORDER BY
        CASE o.status
            WHEN com.shiro.cosnima.model.OfferStatus.PENDING   THEN 0
            WHEN com.shiro.cosnima.model.OfferStatus.ACCEPTED  THEN 1
            WHEN com.shiro.cosnima.model.OfferStatus.REJECTED  THEN 2
            WHEN com.shiro.cosnima.model.OfferStatus.CANCELLED THEN 3
            ELSE 4
        END,
        o.createdAt DESC
""")
    List<Offer> findAllIncomingOffers(@Param("sellerId") UUID sellerId);


    // Keep the old PENDING-only query in case it is used elsewhere
    @Query("""
        SELECT o FROM Offer o
        WHERE o.listing.id = :listingId
        AND o.status = com.shiro.cosnima.model.OfferStatus.PENDING
    """)
    List<Offer> findPendingByListingId(@Param("listingId") String listingId);





    // Buyer: get all own offers (all statuses)
    @Query("""
        SELECT o FROM Offer o
        JOIN FETCH o.listing l
        LEFT JOIN FETCH l.images
        LEFT JOIN FETCH l.seller
        WHERE o.buyer.id = :buyerId
        ORDER BY o.createdAt DESC
    """)
    List<Offer> findByBuyerId(@Param("buyerId") UUID userId);

    Optional<Offer> findById(UUID id);
}