package com.shiro.cosnima.dto.response;

import com.shiro.cosnima.model.User;

public class UserProfileDto {

    private String username;
    private String email;
    private String bio;
    private String avatarUrl;

    public String getAvatarPublicId() {
        return avatarPublicId;
    }

    public void setAvatarPublicId(String avatarPublicId) {
        this.avatarPublicId = avatarPublicId;
    }

    private String avatarPublicId;

    // ===== Constructors =====
    public UserProfileDto() {}

    public UserProfileDto(String username, String email, String bio, String avatarUrl,String avatarPublicId) {
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.avatarPublicId = avatarPublicId;
    }

    // ===== Getters & Setters =====
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    // Entity → DTO
    public static UserProfileDto fromEntity(User user) {
        if (user == null) return null;
        return new UserProfileDto(
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getAvatarPublicId()
        );
    }

    // DTO → Entity (update only safe fields)
    public static void updateEntity(User user, UserProfileDto dto) {
        if (user == null || dto == null) return;

        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setBio(dto.getBio());
        user.setAvatarUrl(dto.getAvatarUrl());
    }
}