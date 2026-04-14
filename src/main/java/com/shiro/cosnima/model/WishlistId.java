package com.shiro.cosnima.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;

@Embeddable
public class WishlistId implements Serializable {

    private UUID userId;
    private UUID listingId;

    public WishlistId() {}

    public WishlistId(UUID userId, UUID listingId) {
        this.userId = userId;
        this.listingId = listingId;
    }

    // getters & setters

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public UUID getListingId() {
        return listingId;
    }

    public void setListingId(UUID listingId) {
        this.listingId = listingId;
    }
}
