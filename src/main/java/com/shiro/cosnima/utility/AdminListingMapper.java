package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.response.AdminListingResponse;
import com.shiro.cosnima.model.Listing;

import java.util.stream.Collectors;

public class AdminListingMapper {

    // ─────────────────────────────
    // ENTITY → DTO
    // ─────────────────────────────
    public static AdminListingResponse toDto(Listing listing) {

        if (listing == null) return null;

        AdminListingResponse dto = new AdminListingResponse();

        dto.setId(listing.getId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setStatus(listing.getStatus() != null ? listing.getStatus().name() : null);
        dto.setCreatedAt(listing.getCreatedAt());

        // ── Seller Info ──
        if (listing.getSeller() != null) {
            dto.setSellerId(listing.getSeller().getId());
            dto.setSellerUsername(listing.getSeller().getUsername());
            dto.setSellerEmail(listing.getSeller().getEmail());
        }



        // ── Images ──
        if (listing.getImages() != null) {
            dto.setImageUrls(
                    listing.getImages()
                            .stream()
                            .map(img -> img.getImageUrl())
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }


}
