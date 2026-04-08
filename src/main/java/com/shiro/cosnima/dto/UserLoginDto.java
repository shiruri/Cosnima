package com.shiro.cosnima.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class UserLoginDto {

    @NotBlank(message = "Login is required")
    @Size(max = 50, message = "Login must be at most 50 characters")
    private String login;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    // ===== Constructors =====
    public UserLoginDto() {}

    public UserLoginDto(String login, String password) {
        this.login = login;
        this.password = password;
    }

    // ===== Getters & Setters =====
    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
