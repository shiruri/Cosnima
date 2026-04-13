package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.CreateOfferRequest;
import com.shiro.cosnima.dto.request.RentalRequest;
import com.shiro.cosnima.dto.response.OfferResponse;
import com.shiro.cosnima.dto.response.RentalResponse;
import com.shiro.cosnima.model.OfferStatus;
import com.shiro.cosnima.model.Rental;
import com.shiro.cosnima.model.RentalStatus;
import com.shiro.cosnima.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/rental")
public class RentalController {

    private final RentalService rentalServ;

    public RentalController(RentalService rentalServ) {
        this.rentalServ = rentalServ;
    }

    // ─────────────────────────────
    // GET CURRENT USER ID
    // ─────────────────────────────
    private UUID getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Unauthorized");
        }

        return UUID.fromString(auth.getName());
    }

    // ─────────────────────────────
    // RENTER SIDE
    // ─────────────────────────────
    @GetMapping("/mine")
    public ResponseEntity<List<RentalResponse>> getMyRentals(
            @RequestParam(required = false) RentalStatus status) {

        try {
            UUID userId = getUserId();

            List<RentalResponse> rentals = (status != null)
                    ? rentalServ.getMyRentalsByStatus(userId, status)
                    : rentalServ.getMyRentals(userId);

            return ResponseEntity.ok(rentals);

        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    // ─────────────────────────────
    // SELLER SIDE
    // ─────────────────────────────
    @GetMapping("/my-listings")
    public ResponseEntity<List<RentalResponse>> getRequestsOnMyListings(
            @RequestParam(required = false) RentalStatus status) {

        try {
            UUID userId = getUserId();

            List<RentalResponse> rentals = (status != null)
                    ? rentalServ.getRequestsOnMyListingsByStatus(userId, status)
                    : rentalServ.getRequestsOnMyListings(userId);

            return ResponseEntity.ok(rentals);

        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @PostMapping()
    public ResponseEntity<RentalResponse> requestRental(@RequestBody @Valid RentalRequest rentalRequest,
                                        BindingResult result) {
        if(!result.hasErrors()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    UUID userId = UUID.fromString(auth.getName());
                    RentalResponse rental = rentalServ.requestRent(userId,rentalRequest);
                    if(rental != null) {
                        return ResponseEntity.ok().body(rental);
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


    @PostMapping("/{rentalId}/approve")
    public ResponseEntity<RentalResponse> approveRental(@PathVariable("id") long rentalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            RentalResponse rental = rentalServ.approveRental(rentalId,UUID.fromString(auth.getName()));
            if(rental != null) {
                return ResponseEntity.ok().body(rental);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<RentalResponse> rejectRental(@PathVariable("id") long rentalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            RentalResponse rental = rentalServ.rejectRental(rentalId,UUID.fromString(auth.getName()));
            if(rental != null) {
                return ResponseEntity.ok().body(rental);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<RentalResponse> completeRental(@PathVariable("id") long rentalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            RentalResponse rental = rentalServ.completeRental(rentalId,UUID.fromString(auth.getName()));
            if(rental != null) {
                return ResponseEntity.ok().body(rental);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<RentalResponse> cancelRental(@PathVariable("id") long rentalId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            RentalResponse rental = rentalServ.approveRental(rentalId,UUID.fromString(auth.getName()));
            if(rental != null) {
                return ResponseEntity.ok().body(rental);

            }
            return ResponseEntity.badRequest().build();

        }
        return ResponseEntity.status(401).build();
    }


}
