package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @Query("""
SELECT c FROM Conversation c
WHERE c.listing.id = :listingId
AND (
   (c.buyer.id = :senderId AND c.seller.id = :receiverId)
   OR
   (c.buyer.id = :receiverId AND c.seller.id = :senderId)
)
""")
    Conversation findBetweenUsersAndListing(
            UUID senderId,
            UUID receiverId,
            String listingId
    );

    Conversation findBySellerIdAndListingId(UUID sellerId, String listingId);

    @Query("SELECT c FROM Conversation c WHERE (c.buyer.id = :userId OR c.seller.id = :userId) AND c.listing.status <> com.shiro.cosnima.model.Listing.Status.ARCHIVED")
    List<Conversation> findAllByUserId(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c WHERE c.listing.id = :listingId AND c.buyer.id = :buyerId")
    Optional<Conversation> findExistingConversation(
            @Param("listingId") String listingId,
            @Param("buyerId") UUID buyerId
    );

}
