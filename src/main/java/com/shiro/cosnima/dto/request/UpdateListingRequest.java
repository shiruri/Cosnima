package com.shiro.cosnima.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class UpdateListingRequest {

    private String title;

    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;

    private String type;

    private String condition;

    private String size;

    private String characterName;

    private String seriesName;

    private String location;

    private Boolean conventionPickup;

    private ImageUpdateMode imageMode;

    private List<CreateImageDto> images;

    // getters & setters

    public ImageUpdateMode getImageMode() { return imageMode; }
    public void setImageMode(ImageUpdateMode imageMode) { this.imageMode = imageMode; }


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

    public List<CreateImageDto> getImages() { return images; }
    public void setImages(List<CreateImageDto> images) { this.images = images; }
}
