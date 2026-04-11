package com.shiro.cosnima.model;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class ListingViewId implements Serializable {

    private String listingId;
    private UUID userId;

    public ListingViewId() {}

    public ListingViewId(String listingId, UUID userId) {
        this.listingId = listingId;
        this.userId = userId;
    }

    // getters & setters

    public String getListingId() {
        return listingId;
    }

    public void setListingId(String listingId) {
        this.listingId = listingId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    // IMPORTANT: equals & hashCode

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ListingViewId that)) return false;
        return Objects.equals(listingId, that.listingId) &&
                Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(listingId, userId);
    }
}
