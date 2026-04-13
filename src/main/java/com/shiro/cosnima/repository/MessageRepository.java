package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    @Query("""
    SELECT m FROM Message m
    WHERE m.conversation.id = :conversationId
    ORDER BY m.sentAt ASC
""")
    List<Message> findAllByConversationId(@Param("conversationId") String conversationId);

    @Query("""
UPDATE Message m
SET m.isRead = true
WHERE m.conversation.id = :conversationId
AND m.sender.id <> :userId
""")
    @Modifying
    void markConversationAsRead(String conversationId, UUID userId);


}