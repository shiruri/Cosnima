package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.response.WishlistResponse;
import com.shiro.cosnima.model.ApiException;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.model.Wishlist;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.repository.WishlistsRepository;
import com.shiro.cosnima.utility.WishlistMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class WishlistsService {

    private final WishlistsRepository wishlistsRepo;
    private final ListingRepository listingRepo;
    private final UserRepository userRepo;


    public WishlistsService(WishlistsRepository wishlistsRepo, ListingRepository listingRepo, UserRepository userRepo) {
        this.wishlistsRepo = wishlistsRepo;
        this.listingRepo = listingRepo;
        this.userRepo = userRepo;
    }

    public List<WishlistResponse> getUserWishlists(UUID uuid) {
        return wishlistsRepo.getUserWishListsByUserId(uuid).stream().map(WishlistMapper::toDto).toList();

    }

    public Long countListingWishlist(String listingId) {
       return wishlistsRepo.countByListingId(listingId);
    }

    public WishlistResponse wishlistListing(UUID userId, String listingId) {

        Optional<Wishlist> existing = wishlistsRepo
                .findByUserIdAndListingId(userId, listingId);

        if (existing.isPresent()) {
            throw ApiException.conflict("Already wishlisted this listing.");
        }

        Listing listing = listingRepo.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (listing.getStatus() == Listing.Status.ARCHIVED) {
            throw ApiException.badRequest("This listing is no longer available");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wishlist wishlist = new Wishlist();
        wishlist.setListing(listing);
        wishlist.setUser(user);

        Wishlist saved = wishlistsRepo.save(wishlist);

        return WishlistMapper.toDto(saved);
    }


    public void deleteWishlist(UUID userId, String listingId) {

        Optional<Wishlist> existingReport = wishlistsRepo.findByListingId(listingId);

        if (existingReport.isEmpty()) {
            throw ApiException.notFound("No Wishlist Found");
        }
        wishlistsRepo.deleteByUser_IdAndListing_Id(userId,listingId);

    }
}
