package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.AutoSendMessageRequest;
import com.shiro.cosnima.dto.request.ConversationRequest;
import com.shiro.cosnima.dto.request.MessageRequest;
import com.shiro.cosnima.dto.response.ConversationResponse;
import com.shiro.cosnima.dto.response.MessageResponse;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class MessageController {

    private final MessageService messageServ;

    @Autowired
    public MessageController(MessageService messageServ) {
        this.messageServ = messageServ;
    }

    @GetMapping("")
    public ResponseEntity<List<ConversationResponse>> getUserConversations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                List<ConversationResponse> conversations = messageServ.getUserConversations(auth.getName());
                return ResponseEntity.ok(conversations != null ? conversations : List.of());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable("id") String conversationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                List<MessageResponse> messages = messageServ.getUserMessages(conversationId);
                return ResponseEntity.ok(messages != null ? messages : List.of());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping()
    public ResponseEntity<ConversationResponse> startConversation(@RequestBody ConversationRequest conversationRequest) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                ConversationResponse conversation = messageServ.startConversation(conversationRequest);
                return ResponseEntity.ok(conversation);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/messages/send") ResponseEntity<MessageResponse> sendMessage(
           @RequestBody MessageRequest messageReq) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                MessageResponse messages = messageServ.sendMessage(messageReq,UUID.fromString(auth.getName()));
                return ResponseEntity.ok(messages);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }


    @PostMapping("/{conversationId}/read")
    public ResponseEntity<Void> readMessage(@PathVariable String conversationId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).build();
        }

        try {
            UUID userId = UUID.fromString(auth.getName());
            messageServ.readMessage(conversationId, userId);
            return ResponseEntity.ok().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }


    @PostMapping("/messages/send/auto") ResponseEntity<MessageResponse> sendAutoMessage(
            @RequestParam(required = false) UUID id,
            @RequestBody AutoSendMessageRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                MessageResponse messages = messageServ.sendAutoMessage(request,id);
                return ResponseEntity.ok(messages);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }


}
