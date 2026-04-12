package com.shiro.cosnima.dto.request;

import java.math.BigDecimal;

public class ListingRequest {
    private int page = 0;
    private int pageSize = 12;
    private String sortBy = "createdAt";
    private String sortDir = "desc";
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String condition;
    private Boolean isActive = true;
    private String status = "AVAILABLE";

    // ===== ADD THESE MISSING FIELDS =====
    private String type;      // "SELL" or "RENT"
    private String size;      // "XS", "S", "M", "L", "XL", "XXL"
    private String series;    // series name (maps to seriesName in entity)

    // Getters and Setters for all fields
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }
}