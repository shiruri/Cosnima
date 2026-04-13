package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.CreateOfferRequest;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.model.OfferStatus;
import com.shiro.cosnima.service.OffersService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.naming.Binding;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/offers")
public class OffersController {

    private final OffersService offerServ;


    public OffersController(OffersService offerServ) {
        this.offerServ = offerServ;
    }

    @GetMapping("/incoming")
    public ResponseEntity<List<OfferResponse>> getIncomingOffers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            List<OfferResponse> offers = offerServ.getIncomingOffers(UUID.fromString(auth.getName()));
            return ResponseEntity.ok(offers != null ? offers : List.of());
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("listing/{id}")
    public ResponseEntity<List<OfferResponse>> getOffers(@PathVariable String id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            List<OfferResponse> offers = offerServ.getOffers(id);
            return ResponseEntity.ok(offers != null ? offers : List.of());
        }
        return ResponseEntity.status(401).build();
    }

    @GetMapping("/mine")
    public ResponseEntity<List<OfferResponse>> getUserOffers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            try {
                UUID userId = UUID.fromString(auth.getName());
                List<OfferResponse> offers = offerServ.getUserOffers(userId);
                return ResponseEntity.ok(offers != null ? offers : List.of());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).build();
            }
        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<OfferResponse> acceptOffer(@PathVariable("id") UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            OfferResponse offer = offerServ.acceptOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<OfferResponse> rejectOffer(@PathVariable("id") UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            OfferResponse offer = offerServ.rejectOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }
    @PostMapping("/{id}/cancel")
    public ResponseEntity<OfferResponse> cancelOffer(@PathVariable("id") UUID offerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            OfferResponse offer = offerServ.cancelOffer(offerId);
            if(offer != null) {
                return ResponseEntity.ok().body(offer);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }
    @PostMapping("/listing/{id}")
    public ResponseEntity<OfferResponse> makeOffer(@PathVariable String id,
                                                   @RequestBody @Valid CreateOfferRequest offerRequest, BindingResult result) {
        if(!result.hasErrors()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    UUID userId = UUID.fromString(auth.getName());
                    OfferResponse offer = offerServ.makeOffer(id, userId, offerRequest);
                    if(offer != null) {
                        return ResponseEntity.ok().body(offer);
                    }
                    return ResponseEntity.badRequest().build();
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.status(401).build();
                }
            }
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/me")
    public ResponseEntity<List<OfferResponse>> getOffers(
            @RequestParam(required = false) OfferStatus status){

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).build();
        }

        try {
            UUID userId = UUID.fromString(auth.getName());
            List<OfferResponse> offers = offerServ.getOffersByStatus(userId, status);
            return ResponseEntity.ok(offers);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).build();
        }
    }




}

