package com.shiro.cosnima.dto.request;

import java.util.UUID;

public class WishlistRequest {

    private UUID listingId;

    // getter & setter

    public UUID getListingId() {
        return listingId;
    }

    public void setListingId(UUID listingId) {
        this.listingId = listingId;
    }
}
