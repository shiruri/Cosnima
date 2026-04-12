package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.CreateOfferRequest;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.service.OffersService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/offers")
public class OffersController {

    private final OffersService offerServ;


    public OffersController(OffersService offerServ) {
        this.offerServ = offerServ;
    }


    @GetMapping("listing/{id}")
    public ResponseEntity<List<OfferResponse>> getOffers(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            List<OfferResponse> offers = offerServ.getOffers(id);
            if(offers != null) {
                return ResponseEntity.ok().body(offers);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/mine")
    public ResponseEntity<List<OfferResponse>> getUserOffers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            List<OfferResponse> offers = offerServ.getUserOffers(UUID.fromString(auth.getName()));
            if(offers != null) {
                return ResponseEntity.ok().body(offers);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<OfferResponse> acceptOffer(@PathVariable UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            OfferResponse offer = offerServ.acceptOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<OfferResponse> rejectOffer(@PathVariable UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            OfferResponse offer = offerServ.rejectOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.badRequest().build();
    }
    @PostMapping("/{id}/accept")
    public ResponseEntity<OfferResponse> cancelOffer(@PathVariable UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            OfferResponse offer = offerServ.cancelOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.badRequest().build();
    }
    @PostMapping("/listing/{id}")
    public ResponseEntity<OfferResponse> makeOffer(@PathVariable String listingId,
                                                   @RequestBody @Valid CreateOfferRequest offerRequest, BindingResult result) {
        if(!result.hasErrors()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null) {
                OfferResponse offer = offerServ.makeOffer(listingId,UUID.fromString(auth.getName()),offerRequest);
                if(offer != null) {
                    return ResponseEntity.ok().body(offer);

                }
                return ResponseEntity.badRequest().build();

            }
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.badRequest().build();
    }


}

