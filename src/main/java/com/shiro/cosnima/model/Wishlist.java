package com.shiro.cosnima.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "wishlists",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "listing_id"}))
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== RELATIONSHIPS =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    // ===== FIELDS =====
    @NotNull
    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt = LocalDateTime.now();

    // ===== CONSTRUCTORS =====
    public Wishlist() {}

    public Wishlist(User user, Listing listing) {
        this.user = user;
        this.listing = listing;
        this.savedAt = LocalDateTime.now();
    }

    // ===== GETTERS & SETTERS =====
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Listing getListing() {
        return listing;
    }

    public void setListing(Listing listing) {
        this.listing = listing;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }

    public void setSavedAt(LocalDateTime savedAt) {
        this.savedAt = savedAt;
    }
}
