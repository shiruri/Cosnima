package com.shiro.cosnima.dto.response;

import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.RentalResponse;
import com.shiro.cosnima.model.Rental;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminUserDetailResponse {

    // ── Basic Info ──
    private UUID id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;

    // ── Activity ──
    private long totalListings;
    private long totalRentals;

    // ── History (recent) ──
    private List<ListingResponse> listings;
    private List<RentalResponse> rentals;

    // ── Getters & Setters ──

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getTotalListings() {
        return totalListings;
    }

    public void setTotalListings(long totalListings) {
        this.totalListings = totalListings;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public List<ListingResponse> getListings() {
        return listings;
    }

    public void setListings(List<ListingResponse> listings) {
        this.listings = listings;
    }

    public List<RentalResponse> getRentals() {
        return rentals;
    }

    public void setRentals(List<RentalResponse> rentals) {
        this.rentals = rentals;
    }
}
