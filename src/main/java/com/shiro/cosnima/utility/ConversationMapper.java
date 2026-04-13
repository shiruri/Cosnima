package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.response.ConversationResponse;
import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Message;

import java.util.Comparator;
import java.util.List;

public class ConversationMapper {

    public static ConversationResponse toDto(Conversation convo) {
        if (convo == null) return null;

        ConversationResponse dto = new ConversationResponse();

        dto.setConversationId(convo.getId());

        if (convo.getListing() != null) {
            dto.setListingId(convo.getListing().getId());
            dto.setListingTitle(convo.getListing().getTitle());
        }

        dto.setBuyerId(convo.getBuyer().getId());
        dto.setSellerId(convo.getSeller().getId());

        if (convo.getMessages() != null && !convo.getMessages().isEmpty()) {

            Message last = convo.getMessages().stream()
                    .max(Comparator.comparing(Message::getSentAt))
                    .orElse(null);

            if (last != null) {
                dto.setLastMessage(last.getContent());
                dto.setLastMessageTime(last.getSentAt());
            }
        }

        dto.setUnreadCount(0);

        return dto;
    }

}
