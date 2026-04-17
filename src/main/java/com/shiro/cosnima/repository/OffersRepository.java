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


    boolean existsByListing_IdAndStatus(String listingId, OfferStatus status);
    Offer findByBuyerIdAndListingId(UUID buyerId, String listingId);

    @Query("SELECT o FROM Offer o JOIN FETCH o.listing l LEFT JOIN FETCH l.images LEFT JOIN FETCH l.seller WHERE o.buyer.id = :buyerId AND o.status = :status AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED ORDER BY o.createdAt DESC")
    List<Offer> findByOfferStatus(@Param("buyerId") UUID buyerId, @Param("status") OfferStatus status);

    @Query("SELECT o FROM Offer o JOIN FETCH o.listing l LEFT JOIN FETCH l.images LEFT JOIN FETCH l.seller WHERE o.listing.id = :listingId AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED ORDER BY CASE o.status WHEN com.shiro.cosnima.model.OfferStatus.PENDING THEN 0 WHEN com.shiro.cosnima.model.OfferStatus.ACCEPTED THEN 1 WHEN com.shiro.cosnima.model.OfferStatus.REJECTED THEN 2 WHEN com.shiro.cosnima.model.OfferStatus.CANCELLED THEN 3 ELSE 4 END, o.createdAt DESC")
    List<Offer> findAllByListingId(@Param("listingId") String listingId);

    @Query("SELECT o FROM Offer o JOIN FETCH o.listing l LEFT JOIN FETCH l.images LEFT JOIN FETCH l.seller LEFT JOIN FETCH o.buyer WHERE l.seller.id = :sellerId AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED ORDER BY CASE o.status WHEN com.shiro.cosnima.model.OfferStatus.PENDING THEN 0 WHEN com.shiro.cosnima.model.OfferStatus.ACCEPTED THEN 1 WHEN com.shiro.cosnima.model.OfferStatus.REJECTED THEN 2 WHEN com.shiro.cosnima.model.OfferStatus.CANCELLED THEN 3 ELSE 4 END, o.createdAt DESC")
    List<Offer> findAllIncomingOffers(@Param("sellerId") UUID sellerId);

    @Query("SELECT o FROM Offer o WHERE o.listing.id = :listingId AND o.status = com.shiro.cosnima.model.OfferStatus.PENDING")
    List<Offer> findPendingByListingId(@Param("listingId") String listingId);

    @Query("SELECT o FROM Offer o JOIN FETCH o.listing l LEFT JOIN FETCH l.images LEFT JOIN FETCH l.seller WHERE o.buyer.id = :buyerId AND l.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED ORDER BY o.createdAt DESC")
    List<Offer> findByBuyerId(@Param("buyerId") UUID userId);

    Optional<Offer> findById(UUID id);
}