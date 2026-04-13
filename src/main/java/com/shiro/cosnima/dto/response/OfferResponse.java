package com.shiro.cosnima.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class OfferResponse {

    private UUID id;

    private String listingId;
    private String listingTitle;
    private BigDecimal listedPrice;   // ← added: the listing's asking price

    private UUID buyerId;
    private String buyerUsername;

    private BigDecimal offeredPrice;
    private String message;

    private String status;

    private LocalDateTime createdAt;

    // ===== GETTERS =====

    public UUID getId()                  { return id; }
    public String getListingId()         { return listingId; }
    public String getListingTitle()      { return listingTitle; }
    public BigDecimal getListedPrice()   { return listedPrice; }
    public UUID getBuyerId()             { return buyerId; }
    public String getBuyerUsername()     { return buyerUsername; }
    public BigDecimal getOfferedPrice()  { return offeredPrice; }
    public String getMessage()           { return message; }
    public String getStatus()            { return status; }
    public LocalDateTime getCreatedAt()  { return createdAt; }

    // ===== SETTERS =====

    public void setId(UUID id)                         { this.id = id; }
    public void setListingId(String listingId)         { this.listingId = listingId; }
    public void setListingTitle(String listingTitle)   { this.listingTitle = listingTitle; }
    public void setListedPrice(BigDecimal listedPrice) { this.listedPrice = listedPrice; }
    public void setBuyerId(UUID buyerId)               { this.buyerId = buyerId; }
    public void setBuyerUsername(String buyerUsername) { this.buyerUsername = buyerUsername; }
    public void setOfferedPrice(BigDecimal offeredPrice){ this.offeredPrice = offeredPrice; }
    public void setMessage(String message)             { this.message = message; }
    public void setStatus(String status)               { this.status = status; }
    public void setCreatedAt(LocalDateTime createdAt)  { this.createdAt = createdAt; }
}