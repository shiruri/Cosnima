package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.request.CreateOfferRequest;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Offer;
import com.shiro.cosnima.model.OfferStatus;
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
    private final ListingRepository listingRepo;

    @Autowired
    public OffersService(OffersRepository offerRepo, UserRepository userRepo, ListingRepository listingRepo) {
        this.offerRepo   = offerRepo;
        this.userRepo    = userRepo;
        this.listingRepo = listingRepo;
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
        Offer offer = offerRepo.findById(offerId).orElseThrow();
        offer.setStatus(OfferStatus.ACCEPTED);
        offer.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(offerRepo.save(offer));
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
        return mapToResponse(offerRepo.save(offer));
    }


    private OfferResponse mapToResponse(Offer offer) {
        OfferResponse dto = new OfferResponse();

        dto.setId(offer.getId());

        dto.setListingId(offer.getListing().getId());
        dto.setListingTitle(offer.getListing().getTitle());
        dto.setListedPrice(offer.getListing().getPrice());  // ← was missing

        dto.setBuyerId(offer.getBuyer().getId());
        dto.setBuyerUsername(offer.getBuyer().getUsername());

        dto.setOfferedPrice(offer.getOfferedPrice());
        dto.setMessage(offer.getMessage());

        dto.setStatus(offer.getStatus().name());
        dto.setCreatedAt(offer.getCreatedAt());

        return dto;
    }
}