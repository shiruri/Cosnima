package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Offer;
import com.shiro.cosnima.model.OfferStatus;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OffersRepository extends JpaRepository<Offer, UUID> {


    @Query("""
    SELECT o FROM Offer o
    WHERE o.listing.id = :listingId
    AND o.status = com.shiro.cosnima.model.OfferStatus.PENDING
""")
    List<Offer> findPendingByListingId(@Param("listingId") String listingId);

    List<Offer> findByBuyerId(UUID userId);
    Offer findByOfferId(UUID id);





}
