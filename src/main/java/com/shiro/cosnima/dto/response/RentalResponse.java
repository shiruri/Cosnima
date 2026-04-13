package com.shiro.cosnima.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class RentalResponse {

    private Long id;

    private String listingId;
    private String listingTitle;

    private UUID renterId;
    private String renterUsername;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal totalPrice;
    private BigDecimal deposit;

    private String status;

    // ─────────────────────────────
    // Getters & Setters
    // ─────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getListingId() {
        return listingId;
    }

    public void setListingId(String listingId) {
        this.listingId = listingId;
    }

    public String getListingTitle() {
        return listingTitle;
    }

    public void setListingTitle(String listingTitle) {
        this.listingTitle = listingTitle;
    }

    public UUID getRenterId() {
        return renterId;
    }

    public void setRenterId(UUID renterId) {
        this.renterId = renterId;
    }

    public String getRenterUsername() {
        return renterUsername;
    }

    public void setRenterUsername(String renterUsername) {
        this.renterUsername = renterUsername;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
