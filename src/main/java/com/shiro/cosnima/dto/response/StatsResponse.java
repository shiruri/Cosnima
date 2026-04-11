package com.shiro.cosnima.dto.response;

public class StatsResponse {

    public long getListings() {
        return listings;
    }

    public StatsResponse() {
    }

    public void setListings(long listings) {
        this.listings = listings;
    }

    private long listings;

    public long getSellers() {
        return sellers;
    }

    public void setSellers(long sellers) {
        this.sellers = sellers;
    }

    public StatsResponse(long listings, long sellers) {
        this.listings = listings;
        this.sellers = sellers;
    }

    private long sellers;
}
