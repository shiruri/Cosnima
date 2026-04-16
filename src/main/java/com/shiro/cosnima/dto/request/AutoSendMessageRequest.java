package com.shiro.cosnima.dto.request;

import java.util.UUID;

public class AutoSendMessageRequest {

    private UUID senderId;
    private String listingId;
    private String content;

    // ===== Constructors =====

    public AutoSendMessageRequest() {
    }

    public AutoSendMessageRequest(UUID senderId, String listingId, String content) {
        this.senderId = senderId;
        this.listingId = listingId;
        this.content = content;
    }

    // ===== Getters =====

    public UUID getSenderId() {
        return senderId;
    }

    public String getListingId() {
        return listingId;
    }

    public String getContent() {
        return content;
    }

    // ===== Setters =====

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public void setListingId(String listingId) {
        this.listingId = listingId;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
