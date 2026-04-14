package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.response.WishlistResponse;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Report;
import com.shiro.cosnima.model.Wishlist;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.repository.WishlistsRepository;
import com.shiro.cosnima.utility.WishlistMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
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

    public WishlistResponse wishlistListing(UUID userId, String listingId) {

        Optional<Wishlist> existingReport = wishlistsRepo.findByListingId(listingId);

        if (existingReport.isPresent()) {
            throw new RuntimeException("You already Wishlisted this target.");
        }
        Listing listing = listingRepo.findById(listingId).orElseThrow();
        Wishlist wishlist = new Wishlist();

        wishlist.setListing(listing);
        wishlist.setUser(userRepo.findUserById(userId).orElseThrow());
        return WishlistMapper.toDto(wishlistsRepo.save(wishlist));

    }

    public void deleteWishlist(UUID userId, String listingId) {

        Optional<Wishlist> existingReport = wishlistsRepo.findByListingId(listingId);

        if (existingReport.isEmpty()) {
            throw new RuntimeException("No Wishist Found");
        }
        wishlistsRepo.deleteByUser_IdAndListing_Id(userId,listingId);

    }
}
