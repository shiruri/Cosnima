package com.shiro.cosnima.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ListingResponse {

    private String id;

    // Seller info (flattened to avoid sending full User entity)
    private UUID sellerId;
    private String sellerUsername;

    // Images (simple URLs instead of full Image entity)
    private List<ImageResponse> images;

    private String title;
    private String description;
    private BigDecimal price;

    private String type;
    private String condition;

    private String size;
    private String characterName;
    private String seriesName;
    private String location;

    private Boolean conventionPickup;

    private String status;
    private Boolean isActive;

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    private Integer viewCount;

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    private List<String> tags;

    // ===== PERMISSIONS =====
    private Boolean isOwner;
    private Boolean canEdit;
    private Boolean canDelete;
    public Boolean getIsOwner() {
        return isOwner;
    }

    public void setIsOwner(Boolean isOwner) {
        this.isOwner = isOwner;
    }

    public Boolean getCanEdit() {
        return canEdit;
    }

    public void setCanEdit(Boolean canEdit) {
        this.canEdit = canEdit;
    }

    public Boolean getCanDelete() {
        return canDelete;
    }

    public void setCanDelete(Boolean canDelete) {
        this.canDelete = canDelete;
    }


    private LocalDateTime createdAt;

    // ===== GETTERS & SETTERS =====

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public UUID getSellerId() { return sellerId; }
    public void setSellerId(UUID sellerId) { this.sellerId = sellerId; }

    public String getSellerUsername() { return sellerUsername; }
    public void setSellerUsername(String sellerUsername) { this.sellerUsername = sellerUsername; }

    public void setImages(List<ImageResponse> images) {
        this.images = images;
    }
    public List<ImageResponse> getImages() {
        return this.images;
    }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getCharacterName() { return characterName; }
    public void setCharacterName(String characterName) { this.characterName = characterName; }

    public String getSeriesName() { return seriesName; }
    public void setSeriesName(String seriesName) { this.seriesName = seriesName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Boolean getConventionPickup() { return conventionPickup; }
    public void setConventionPickup(Boolean conventionPickup) { this.conventionPickup = conventionPickup; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
