package com.shiro.cosnima.controller;


import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.dto.response.WishlistResponse;
import com.shiro.cosnima.service.WishlistsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


 // TODO INTEGRATE LOGIC FOR RENTAL _ RENT - SALE NOTES AND WISHLISTS AND DESING PROBLEM AND AUTO MESSAGING

@RestController
@RequestMapping("api/wishlists")
public class WishlistController {

    private final WishlistsService wishlistsServ;

    public WishlistController(WishlistsService wishlistsServ) {
        this.wishlistsServ = wishlistsServ;
    }

    @GetMapping("/{listingId}/count")
    public ResponseEntity<Long> getListingWishlistCount(@PathVariable String listingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                Long wishlistsCount = wishlistsServ.countListingWishlist(listingId);
                if (wishlistsCount != null) {
                    return ResponseEntity.ok().body(wishlistsCount);
                }
                return ResponseEntity.badRequest().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping()
    public ResponseEntity<List<WishlistResponse>> getUserWishlists() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                UUID userId = UUID.fromString(auth.getName());
                List<WishlistResponse> wishlists = wishlistsServ.getUserWishlists(userId);
                if (wishlists != null) {
                    return ResponseEntity.ok().body(wishlists);
                }
                return ResponseEntity.badRequest().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{listingId}/wishlist")
    public ResponseEntity<WishlistResponse> wishlistListing(@PathVariable String listingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                UUID userId = UUID.fromString(auth.getName());
                WishlistResponse wishlists = wishlistsServ.wishlistListing(userId,listingId);
                if (wishlists != null) {
                    return ResponseEntity.ok().body(wishlists);
                }
                return ResponseEntity.badRequest().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<String> deleteWishlist(@PathVariable String listingId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                UUID userId = UUID.fromString(auth.getName());
                wishlistsServ.deleteWishlist(userId,listingId);
                return ResponseEntity.ok().build();
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.badRequest().build();
    }

}