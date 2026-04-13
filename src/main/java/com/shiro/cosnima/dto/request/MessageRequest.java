package com.shiro.cosnima.dto.request;

public class MessageRequest {

    private String conversationId;
    private String content;

    // getters & setters

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
