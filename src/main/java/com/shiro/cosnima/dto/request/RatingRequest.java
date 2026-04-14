package com.shiro.cosnima.dto.request;


import jakarta.validation.constraints.*;
import java.util.UUID;

public class RatingRequest {

    @NotNull
    private UUID ratedUserId;

    @NotNull
    private String transactionType; // SALE or RENTAL

    @NotNull
    private String transactionId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer stars;

    private String comment;

    // ===== GETTERS & SETTERS =====

    public UUID getRatedUserId() {
        return ratedUserId;
    }

    public void setRatedUserId(UUID ratedUserId) {
        this.ratedUserId = ratedUserId;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

