package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.request.CreateOfferRequest;
import com.shiro.cosnima.dto.request.MessageRequest;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.model.Conversation;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Offer;
import com.shiro.cosnima.model.OfferStatus;
import com.shiro.cosnima.repository.ConversationRepository;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.OffersRepository;
import com.shiro.cosnima.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OffersService {

    private final OffersRepository offerRepo;
    private final UserRepository userRepo;
    private final ConversationRepository conversationRepo;
    private final ListingRepository listingRepo;
    private final MessageService messageServ;
    @Autowired
    public OffersService(OffersRepository offerRepo, UserRepository userRepo, ConversationRepository conversationRepo, ListingRepository listingRepo, MessageService messageServ) {
        this.offerRepo   = offerRepo;
        this.userRepo    = userRepo;
        this.conversationRepo = conversationRepo;
        this.listingRepo = listingRepo;
        this.messageServ = messageServ;
    }

    public List<OfferResponse> getIncomingOffers(UUID userId) {
        return offerRepo.findAllIncomingOffers(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<OfferResponse> getOffersByStatus(UUID buyerId, OfferStatus status) {
        if (status == null) {
            return offerRepo.findByBuyerId(buyerId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return offerRepo.findByOfferStatus(buyerId, status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    public List<OfferResponse> getOffers(String listingId) {
        return offerRepo.findAllByListingId(listingId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    public List<OfferResponse> getUserOffers(UUID userId) {
        return offerRepo.findByBuyerId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public OfferResponse acceptOffer(UUID offerId) {
        Offer accepted = offerRepo.findById(offerId).orElseThrow();

        List<Offer> others = offerRepo.findAllByListingId(accepted.getListing().getId());
        for (Offer o : others) {
            if (!o.getId().equals(offerId) && o.getStatus() == OfferStatus.PENDING) {
                o.setStatus(OfferStatus.REJECTED);
                o.setUpdatedAt(LocalDateTime.now());
            }
        }

        accepted.setStatus(OfferStatus.ACCEPTED);

        // update status of listing
        Listing listing = accepted.getListing();
        listing.setStatus(Listing.Status.SOLD);
        listingRepo.save(listing);

        accepted.setUpdatedAt(LocalDateTime.now());

        try {
            Optional<Conversation> convo = conversationRepo.findExistingConversation(
                    accepted.getListing().getId(),
                    accepted.getBuyer().getId()
            );
            if (convo.isPresent()) {
                MessageRequest autoMsg = new MessageRequest();
                autoMsg.setConversationId(convo.get().getId());
                autoMsg.setContent("Great news! I've accepted your offer of ₱" +
                        accepted.getOfferedPrice() + " for \"" +
                        accepted.getListing().getTitle() + "\". " +
                        "Let's arrange the exchange! Feel free to message me here.");
                messageServ.sendMessage(autoMsg, accepted.getListing().getSeller().getId());
            }

            offerRepo.saveAll(others);

            return mapToResponse(accepted);
        }  catch (Exception e) { /* silently fail */ }

        return mapToResponse(accepted);
    }

    public OfferResponse rejectOffer(UUID offerId) {
        Offer offer = offerRepo.findById(offerId).orElseThrow();
        offer.setStatus(OfferStatus.REJECTED);
        offer.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(offerRepo.save(offer));
    }

    public OfferResponse cancelOffer(UUID offerId) {
        Offer offer = offerRepo.findById(offerId).orElseThrow();
        offer.setStatus(OfferStatus.CANCELLED);
        offer.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(offerRepo.save(offer));
    }

    public OfferResponse makeOffer(String listingId, UUID userId, CreateOfferRequest offerRequest) {
        Listing listing = listingRepo.findById(listingId).orElseThrow();
        Offer offer = new Offer();
        offer.setListing(listing);
        offer.setBuyer(userRepo.findUserById(userId).orElseThrow());
        offer.setOfferedPrice(offerRequest.getOfferedPrice());
        offer.setMessage(offerRequest.getMessage());
        offer.setCreatedAt(LocalDateTime.now());
        offer.setUpdatedAt(LocalDateTime.now());
        offer.setStatus(OfferStatus.PENDING);
        return mapToResponse(offerRepo.save(offer));
    }


    private OfferResponse mapToResponse(Offer offer) {
        OfferResponse dto = new OfferResponse();
        Listing listing = offer.getListing();

        dto.setId(offer.getId());

        dto.setListingId(listing.getId());
        dto.setListingTitle(listing.getTitle());
        dto.setListedPrice(listing.getPrice());

        if (listing.getImages() != null && !listing.getImages().isEmpty()) {
            dto.setListingImageUrl(listing.getImages().get(0).getImageUrl());
        }

        if (listing.getSeller() != null) {
            dto.setSellerId(listing.getSeller().getId());
            dto.setSellerUsername(listing.getSeller().getUsername());
        }

        dto.setBuyerId(offer.getBuyer().getId());
        dto.setBuyerUsername(offer.getBuyer().getUsername());

        dto.setOfferedPrice(offer.getOfferedPrice());
        dto.setMessage(offer.getMessage());

        dto.setStatus(offer.getStatus().name());
        dto.setCreatedAt(offer.getCreatedAt());

        return dto;
    }
}