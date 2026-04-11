package com.shiro.cosnima.model;

import io.micrometer.core.instrument.Tag;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @UuidGenerator
    @Column(columnDefinition = "CHAR(36)")
    private String  id;

    // ===== RELATIONSHIPS =====
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @OneToMany(mappedBy = "listing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ListingImage> images;

    // ===== FIELDS =====
    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String title;

    @Lob
    private String description;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(name = "`condition`")
    private Condition condition;

    @Size(max = 50)
    private String size;

    @Size(max = 100)
    private String characterName;

    @Size(max = 100)
    private String seriesName;

    @Size(max = 200)
    private String location;

    @NotNull
    @Column(nullable = false)
    private Boolean conventionPickup = false;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.AVAILABLE;

    @NotNull
    @Column(nullable = false)
    private Boolean isActive = true;

    @NotNull
    @Column(nullable = false)
    private Integer viewCount = 0;

    private LocalDateTime expiresAt;

    @NotNull
    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @NotNull
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    // ===== ENUMS =====
    public enum Type {
        SELL,
        RENT
    }

    public enum Condition {
        NEW,
        LIKE_NEW,
        USED,
        WORN
    }

    public List<Tags> getTags() {
        return tags;
    }

    public void setTags(List<Tags> tags) {
        this.tags = tags;
    }

    @ManyToMany
    @JoinTable(
            name = "listing_tags",
            joinColumns = @JoinColumn(name = "listing_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tags> tags;

    public enum Status {
        AVAILABLE,
        SOLD,
        RENTED,
        ARCHIVED
    }

    // ===== GETTERS & SETTERS =====
    public String getId() { return id; }
    public void setId(String  id) { this.id = id; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public List<ListingImage> getImages() { return images; }
    public void setImages(List<ListingImage> images) { this.images = images; }


    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }

    public Condition getCondition() { return condition; }
    public void setCondition(Condition condition) { this.condition = condition; }

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

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}