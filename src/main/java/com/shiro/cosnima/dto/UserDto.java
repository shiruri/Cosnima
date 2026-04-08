package com.shiro.cosnima.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import com.shiro.cosnima.model.User;
public class UserDto {

    @Size(max = 50)
    private String username;

    @Email
    @Size(max = 100)
    private String email;

    private String bio;

    private String avatarUrl;

    // ===== Constructors =====
    public UserDto() {}

    public UserDto(String username, String email, String bio, String avatarUrl) {
        this.username = username;
        this.email = email;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
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

    // Convert Entity → DTO
    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getUsername(),
                user.getEmail(),
                user.getBio(),
                user.getAvatarUrl()
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
        return user;
    }

}
