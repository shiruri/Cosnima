package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("""

            SELECT c FROM Conversation c
WHERE c.buyer.id = :userId
   OR c.seller.id = :userId
""")
    List<Conversation> findAllByUserId(@Param("userId") String userId);

    @Query("""
    SELECT c FROM Conversation c
    WHERE c.listing.id = :listingId
      AND c.buyer.id = :buyerId
""")
    Optional<Conversation> findExistingConversation(
            @Param("listingId") String listingId,
            @Param("buyerId") String buyerId
    );

}
