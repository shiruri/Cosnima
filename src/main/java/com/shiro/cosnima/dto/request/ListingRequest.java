package com.shiro.cosnima.dto.request;

import com.shiro.cosnima.model.Listing;
import java.math.BigDecimal;

public class ListingRequest {

    // ===== PAGINATION =====
    private int page = 0;
    private int pageSize = 10;
    private String size; // for XS, S, M

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    // ===== SORTING =====
    private String sortBy = "createdAt";
    private String sortDir = "desc";

    // ===== FILTERS =====
    private String keyword;

    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    private Listing.Condition condition;
    private Boolean isActive;
    private Listing.Status status; //

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    private String tag;

    // ===== GETTERS / SETTERS =====

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

    public Listing.Condition getCondition() { return condition; }
    public void setCondition(Listing.Condition condition) {
        this.condition = condition;
    }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Listing.Status getStatus() { return status; }
    public void setStatus(Listing.Status status) { this.status = status; }
}
