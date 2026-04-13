package com.shiro.cosnima.service;

import com.mysql.cj.Messages;
import com.shiro.cosnima.dto.request.ConversationRequest;
import com.shiro.cosnima.dto.request.MessageRequest;
import com.shiro.cosnima.dto.response.ConversationResponse;
import com.shiro.cosnima.dto.response.MessageResponse;
import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Message;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.ConversationRepository;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.MessageRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.utility.ConversationMapper;
import com.shiro.cosnima.utility.MessageMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class MessageService {

    private final MessageRepository messageRepo;
    private final UserRepository userRepo;
    private final ListingRepository listingRepo;
    private final ConversationRepository conversationRepo;

    @Autowired
    public MessageService(MessageRepository messageRepo, UserRepository userRepo, ListingRepository listingRepo, ConversationRepository conversationRepo) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.listingRepo = listingRepo;
        this.conversationRepo = conversationRepo;
    }

    public List<ConversationResponse> getUserConversations(String userId) {
        return conversationRepo.findAllByUserId(userId).stream()
                .map(ConversationMapper::toDto)
                .toList();
    }

    public List<MessageResponse> getUserMessages(String conversationId) {
        return messageRepo.findAllByConversationId(conversationId).stream()
                .map(MessageMapper::toDto)
                .toList();
    }

    public ConversationResponse startConversation(ConversationRequest req) {

        // 1. Check if conversation already exists
        Optional<Conversation> existing = conversationRepo
                .findExistingConversation(req.getListingId(), req.getBuyerId());

        if (existing.isPresent()) {
            return ConversationMapper.toDto(existing.get());
        }

        // 2. Load entities
        Listing listing = listingRepo.findById(req.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        User buyer = userRepo.findById(UUID.fromString(req.getBuyerId()))
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        User seller = listing.getSeller();

        // 3. Create new conversation
        Conversation conversation = new Conversation();
        conversation.setListing(listing);
        conversation.setBuyer(buyer);
        conversation.setSeller(seller);
        conversation.setCreatedAt(LocalDateTime.now());

        // 4. Save
        Conversation saved = conversationRepo.save(conversation);

        // 5. Return DTO
        return ConversationMapper.toDto(saved);
    }

    public MessageResponse sendMessage(MessageRequest messageReq,UUID userId) {
        Conversation convo = conversationRepo
                .findById(messageReq.getConversationId()).orElseThrow();
        if (!convo.getBuyer().getId().equals(userId)
                && !convo.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Not part of conversation");
        }

        User user = userRepo.findUserById(userId).orElseThrow();
        Message message = new Message();
        message.setConversation(convo);
        message.setSender(user);
        message.setContent(messageReq.getContent());
        message.setRead(false);
        return MessageMapper.toDto(messageRepo.save(message));


    }

    @Transactional
    public void readMessage(String conversationId, UUID userId) {

        Conversation convo = conversationRepo
                .findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        if (!convo.getBuyer().getId().equals(userId)
                && !convo.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Not part of conversation");
        }

        messageRepo.markConversationAsRead(convo.getId(), userId);
    }

}


