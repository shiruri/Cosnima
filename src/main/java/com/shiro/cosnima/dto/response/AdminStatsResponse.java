package com.shiro.cosnima.dto.response;

public class AdminStatsResponse {

    // ── Users ──
    private long totalUsers;
    private long newUsersToday;
    private long activeUsers;
    private long bannedUsers;

    // ── Listings ──
    private long totalListings;
    private long activeListings;
    private long soldListings;
    private long pendingListings;

    // ── Rentals ──
    private long totalRentals;
    private long activeRentals;
    private long completedRentals;

    // ── Messages / Engagement ──
    private long totalMessages;
    private long unreadMessages;

    // ── Reports ──
    private long pendingReports;
    private long resolvedReports;

    // ── Chart Data (weekly counts for graphs) ──
    private long[] usersChart;
    private long[] listingsChart;
    private long[] rentalsChart;

    // ── Getters & Setters ──

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getNewUsersToday() {
        return newUsersToday;
    }

    public void setNewUsersToday(long newUsersToday) {
        this.newUsersToday = newUsersToday;
    }

    public long getActiveUsers() {
        return activeUsers;
    }

    public void setActiveUsers(long activeUsers) {
        this.activeUsers = activeUsers;
    }

    public long getTotalListings() {
        return totalListings;
    }

    public void setTotalListings(long totalListings) {
        this.totalListings = totalListings;
    }

    public long getActiveListings() {
        return activeListings;
    }

    public void setActiveListings(long activeListings) {
        this.activeListings = activeListings;
    }

    public long getSoldListings() {
        return soldListings;
    }

    public void setSoldListings(long soldListings) {
        this.soldListings = soldListings;
    }

    public long getTotalRentals() {
        return totalRentals;
    }

    public void setTotalRentals(long totalRentals) {
        this.totalRentals = totalRentals;
    }

    public long getActiveRentals() {
        return activeRentals;
    }

    public void setActiveRentals(long activeRentals) {
        this.activeRentals = activeRentals;
    }

    public long getCompletedRentals() {
        return completedRentals;
    }

    public void setCompletedRentals(long completedRentals) {
        this.completedRentals = completedRentals;
    }

    public long getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(long totalMessages) {
        this.totalMessages = totalMessages;
    }

    public long getUnreadMessages() {
        return unreadMessages;
    }

    public void setUnreadMessages(long unreadMessages) {
        this.unreadMessages = unreadMessages;
    }

    public long getBannedUsers() { return bannedUsers; }
    public void setBannedUsers(long v) { this.bannedUsers = v; }

    public long getPendingListings() { return pendingListings; }
    public void setPendingListings(long v) { this.pendingListings = v; }

    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long v) { this.pendingReports = v; }

    public long getResolvedReports() { return resolvedReports; }
    public void setResolvedReports(long v) { this.resolvedReports = v; }

    public long[] getUsersChart() { return usersChart; }
    public void setUsersChart(long[] v) { this.usersChart = v; }

    public long[] getListingsChart() { return listingsChart; }
    public void setListingsChart(long[] v) { this.listingsChart = v; }

    public long[] getRentalsChart() { return rentalsChart; }
    public void setRentalsChart(long[] v) { this.rentalsChart = v; }
}
