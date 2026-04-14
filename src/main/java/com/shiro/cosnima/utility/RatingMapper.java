package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.request.RatingRequest;
import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.model.User;

public class RatingMapper {

    // ===== ENTITY → DTO =====
    public static RatingResponse toDto(Rating rating) {
        if (rating == null) return null;

        RatingResponse dto = new RatingResponse();

        dto.setId(rating.getId());

        // rater
        if (rating.getRater() != null) {
            dto.setRaterId(rating.getRater().getId());
            dto.setRaterName(rating.getRater().getUsername());
        }

        // rated user
        if (rating.getRatedUser() != null) {
            dto.setRatedUserId(rating.getRatedUser().getId());
        }

        dto.setTransactionType(
                rating.getTransactionType() != null
                        ? rating.getTransactionType().name()
                        : null
        );

        dto.setTransactionId(rating.getTransactionId());
        dto.setStars(rating.getStars());
        dto.setComment(rating.getComment());
        dto.setCreatedAt(rating.getCreatedAt());

        return dto;
    }

    // ===== REQUEST → ENTITY =====
    public static Rating fromDto(RatingRequest dto, Rating rating, User rater, User ratedUser) {
        if (dto == null || rating == null) return null;

        rating.setRater(rater);
        rating.setRatedUser(ratedUser);

        rating.setTransactionType(
                Rating.TransactionType.valueOf(dto.getTransactionType().toUpperCase())
        );

        rating.setTransactionId(dto.getTransactionId());
        rating.setStars(dto.getStars());
        rating.setComment(dto.getComment());

        return rating;
    }
}
