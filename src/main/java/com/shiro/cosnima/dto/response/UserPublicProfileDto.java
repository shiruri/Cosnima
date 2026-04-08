package com.shiro.cosnima.dto.response;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.model.User;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class UserPublicProfileDto {

    private UUID id;
    private String username;
    private String email;
    private String bio;
    private String avatarUrl;
    private List<Listing> listings;
    private List<Rating> ratings;

    public UserPublicProfileDto() {
    }

    public UserPublicProfileDto(UUID id, String username, String email, String bio, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
    }

    // ===== Converters =====

    public static UserPublicProfileDto fromEntity(User user) {
        if (user == null) return null;
        return new UserPublicProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl()
        );
    }


    // ===== Getters & Setters =====
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public List<Listing> getListings() {
        return listings;
    }

    public void setListings(List<Listing> listings) {
        this.listings = listings;
    }

    public List<Rating> getRatings() {
        return ratings;
    }

    public void setRatings(List<Rating> ratings) {
        this.ratings = ratings;
    }
}