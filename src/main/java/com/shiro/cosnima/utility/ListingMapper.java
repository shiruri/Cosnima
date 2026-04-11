package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.response.ImageResponse;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.model.Tags;

import java.util.stream.Collectors;

public class ListingMapper {

    // Convert Listing entity → ListingResponse DTO
    public static ListingResponse toDto(Listing listing) {
        if (listing == null) return null;

        ListingResponse dto = new ListingResponse();
        dto.setId(listing.getId());
        dto.setSellerId(listing.getSeller().getId());
        dto.setSellerUsername(listing.getSeller().getUsername());

        // Flatten images to URL list
        if (listing.getImages() != null) {
            dto.setImages(
                    listing.getImages()
                            .stream()
                            .map(image -> {
                                ImageResponse ir = new ImageResponse();
                                ir.setId(image.getId());
                                ir.setImageUrl(image.getImageUrl());
                                ir.setPublicId(image.getPublicId());
                                ir.setIsPrimary(image.getIsPrimary());
                                ir.setSortOrder(image.getSortOrder());
                                return ir;
                            })
                            .collect(Collectors.toList())
            );
        }


        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setType(listing.getType() != null ? listing.getType().name() : null);
        dto.setCondition(listing.getCondition() != null ? listing.getCondition().name() : null);
        dto.setSize(listing.getSize());
        dto.setCharacterName(listing.getCharacterName());
        dto.setSeriesName(listing.getSeriesName());
        dto.setLocation(listing.getLocation());
        dto.setConventionPickup(listing.getConventionPickup());
        dto.setStatus(listing.getStatus() != null ? listing.getStatus().name() : null);
        dto.setIsActive(listing.getIsActive());
        dto.setViewCount(listing.getViewCount());
        dto.setCreatedAt(listing.getCreatedAt());
        dto.setTags(
                listing.getTags().stream()
                        .map(Tags::getName)
                        .toList()
        );

        return dto;
    }

    // Optional: Convert DTO → Listing entity (for creating/updating)
    public static Listing fromDto(ListingResponse dto, Listing listing) {
        if (dto == null || listing == null) return null;

        listing.setTitle(dto.getTitle());
        listing.setDescription(dto.getDescription());
        listing.setPrice(dto.getPrice());
        // Enums: convert string back to enum
        if (dto.getType() != null) {
            listing.setType(Listing.Type.valueOf(dto.getType()));
        }
        if (dto.getCondition() != null) {
            listing.setCondition(Listing.Condition.valueOf(dto.getCondition()));
        }
        listing.setSize(dto.getSize());
        listing.setCharacterName(dto.getCharacterName());
        listing.setSeriesName(dto.getSeriesName());
        listing.setLocation(dto.getLocation());
        listing.setConventionPickup(dto.getConventionPickup());
        if (dto.getStatus() != null) {
            listing.setStatus(Listing.Status.valueOf(dto.getStatus()));
        }
        listing.setIsActive(dto.getIsActive());
        listing.setViewCount(dto.getViewCount() != null ? dto.getViewCount() : 0);

        return listing;
    }
}
