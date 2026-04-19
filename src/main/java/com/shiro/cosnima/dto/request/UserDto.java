package com.shiro.cosnima.dto.request;

import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import com.shiro.cosnima.model.User;

import java.util.UUID;

public class UserDto {
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    @Id
    private UUID id;

    @Size(max = 50)
    private String username;

    @Email
    @Size(max = 100)
    private String email;

    private String bio;

    private String avatarUrl;
    private String avatarPublicId;
    private String role;

    public boolean isBanned() {
        return isBanned;
    }

    public void setBanned(boolean banned) {
        isBanned = banned;
    }

    private boolean isBanned;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public double getRatingStars() {
        return ratingStars;
    }

    public void setRatingStars(int ratingStars) {
        this.ratingStars = ratingStars;
    }

    private double ratingStars;

    public long getListingCount() {
        return listingCount;
    }

    public void setListingCount(int listingCount) {
        this.listingCount = listingCount;
    }

    private long listingCount;

    public String getAvatarPublicId() {
        return avatarPublicId;
    }

    public void setAvatarPublicId(String avatarPublicId) {
        this.avatarPublicId = avatarPublicId;
    }

    // ===== Constructors =====
    public UserDto() {
    }

    public UserDto(UUID id, String username, String email, String bio, String avatarUrl, String avatarPublicId
    , double ratingStars, long listingCount)
    {
        this.id = id;
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.avatarPublicId = avatarPublicId;
        this.ratingStars = ratingStars;
        this.listingCount = listingCount;
    }
    public UserDto(UUID id, String username, String email, String bio, String avatarUrl, String avatarPublicId, User.Role role, boolean isBanned) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.avatarPublicId = avatarPublicId;
        this.role = role != null ? role.name() : null;
        this.isBanned = isBanned;
    }

    // ===== Getters & Setters =====
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

    // Convert Entity → DTO
    public static UserDto fromEntity(User user,double ratingCount, long listingCount) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getAvatarPublicId(),
                ratingCount,
                listingCount

        );
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getAvatarPublicId(),
                user.getRole(),
                user.getIsBanned()
        );
    }


    // Convert DTO → Entity (for creating/updating)
    public static User toEntity(UserDto dto) {
        if (dto == null) return null;
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setBio(dto.getBio());
        user.setAvatarUrl(dto.getAvatarUrl());
        user.setAvatarPublicId(dto.getAvatarPublicId());
        return user;

    }

    }

