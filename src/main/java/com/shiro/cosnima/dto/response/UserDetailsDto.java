package com.shiro.cosnima.dto.response;

import java.time.LocalDateTime;

public class UserDetailsDto {

    public int getAverageRating() {
        return averageRating;
    }

    public LocalDateTime getDateJoined() {
        return dateJoined;
    }

    public void setDateJoined(LocalDateTime dateJoined) {
        this.dateJoined = dateJoined;
    }

    public void setAverageRating(int averageRating) {
        this.averageRating = averageRating;
    }

    private int averageRating;

    public UserDetailsDto(int averageRating, LocalDateTime dateJoined) {
        this.averageRating = averageRating;
        this.dateJoined = dateJoined;
    }

    private LocalDateTime dateJoined;

}
