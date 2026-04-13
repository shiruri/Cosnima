package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.response.MessageResponse;
import com.shiro.cosnima.model.Message;

public class MessageMapper {

    public static MessageResponse toDto(Message message) {
        if (message == null) return null;

        MessageResponse dto = new MessageResponse();

        dto.setId(message.getId());

        if (message.getConversation() != null) {
            dto.setConversationId(message.getConversation().getId());
        }

        if (message.getSender() != null) {
            dto.setSenderId(message.getSender().getId());
            dto.setSenderUsername(message.getSender().getUsername());
        }

        dto.setContent(message.getContent());
        dto.setRead(message.isRead());
        dto.setSentAt(message.getSentAt());

        return dto;
    }
}
