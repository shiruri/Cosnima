package com.shiro.cosnima.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class RatingResponse {

    private Long id;

    private UUID raterId;
    private String raterName;

    private UUID ratedUserId;

    private String transactionType;
    private String transactionId;

    private Integer stars;
    private String comment;

    private LocalDateTime createdAt;

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UUID getRaterId() {
        return raterId;
    }

    public void setRaterId(UUID raterId) {
        this.raterId = raterId;
    }

    public String getRaterName() {
        return raterName;
    }

    public void setRaterName(String raterName) {
        this.raterName = raterName;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
