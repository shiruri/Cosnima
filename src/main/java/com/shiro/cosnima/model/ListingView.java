package com.shiro.cosnima.model;

import com.shiro.cosnima.model.ListingViewId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "listing_views")
public class ListingView {

    @EmbeddedId
    private ListingViewId id;

    public ListingView() {}

    public ListingView(String listingId, UUID userId) {
        this.id = new ListingViewId(listingId, userId);
    }
}
