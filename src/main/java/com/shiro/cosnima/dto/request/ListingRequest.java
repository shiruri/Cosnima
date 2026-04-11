package com.shiro.cosnima.dto.request;

import java.math.BigDecimal;

public class ListingRequest {

    // ===== PAGINATION =====
    private int page = 0;     // default first page
    private int size = 10;    // default page size

    // ===== SORTING =====
    private String sortBy = "createdAt";  // default field
    private String sortDir = "desc";      // asc or desc

    // ===== FILTERS =====
    private String keyword;               // search title/description
    private String category;              // category filter

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private String condition;             // e.g. NEW, USED
    private Boolean isAvailable;          // availability filter

    // ===== CONSTRUCTORS =====
    public ListingRequest() {}

    // ===== GETTERS & SETTERS =====
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getSize() { return size; }
    public void setSize(int size) { this.size = size; }

    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }

    public String getSortDir() { return sortDir; }
    public void setSortDir(String sortDir) { this.sortDir = sortDir; }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }
}
