package com.shiro.cosnima.dto.request;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

public class CreateListingDto {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    @NotBlank
    private String type;

    @NotBlank
    private String condition;

    private String size;
    private String characterName;
    private String seriesName;
    private String location;

    private Boolean conventionPickup = false;

    // Only URLs for creation (IDs don’t exist yet)
    private List<MultipartFile> images;

    // ===== GETTERS & SETTERS =====

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

    public List<MultipartFile> getImages() { return images; }
    public void setImages(List<MultipartFile> images) { this.images= images; }
}
