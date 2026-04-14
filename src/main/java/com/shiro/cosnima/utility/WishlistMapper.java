package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.request.WishlistRequest;
import com.shiro.cosnima.dto.response.WishlistResponse;
import com.shiro.cosnima.model.*;

import java.util.UUID;

public class WishlistMapper {

    // =========================================================
    // ENTITY → RESPONSE
    // =========================================================
    public static WishlistResponse toDto(Wishlist wishlist) {
        if (wishlist == null) return null;

        WishlistResponse dto = new WishlistResponse();

        dto.setUserId(wishlist.getUser().getId());

        dto.setListingId(UUID.fromString(wishlist.getListing().getId()));
        dto.setListingTitle(wishlist.getListing().getTitle());
        dto.setListingPrice(wishlist.getListing().getPrice().intValue());

        // optional: first image
        if (wishlist.getListing().getImages() != null &&
                !wishlist.getListing().getImages().isEmpty()) {
            dto.setListingImage(
                    wishlist.getListing().getImages().get(0).getImageUrl()
            );
        }

        dto.setSavedAt(wishlist.getSavedAt());

        return dto;
    }

    // =========================================================
    // REQUEST → ENTITY
    // =========================================================
    public static Wishlist fromDto(
            WishlistRequest dto,
            Wishlist wishlist,
            User user,
            Listing listing
    ) {
        if (dto == null || wishlist == null) return null;

        wishlist.setUser(user);
        wishlist.setListing(listing);
        wishlist.setId(new WishlistId(user.getId(), UUID.fromString(listing.getId())));

        return wishlist;
    }
}
