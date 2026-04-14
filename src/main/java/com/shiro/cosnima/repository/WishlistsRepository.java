package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistsRepository extends JpaRepository<Wishlist, UUID> {

    List<Wishlist> getUserWishListsByUserId(UUID userId);


    Optional<Wishlist> findByListingId(String listingId);

    void deleteByUser_IdAndListing_Id(UUID userId, String listingId);

}
