package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.RatingRequest;
import com.shiro.cosnima.dto.request.RentalRequest;
import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.dto.response.RentalResponse;
import com.shiro.cosnima.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/ratings")
public class RatingController {

    private final RatingService ratingServ;


    public RatingController(RatingService ratingServ) {
        this.ratingServ = ratingServ;
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<List<RatingResponse>> getUserRatings(@PathVariable UUID id) {
        List<RatingResponse> ratings = ratingServ.getUserRatings(id);
        if (ratings != null) {
            return ResponseEntity.ok().body(ratings);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping()
    public ResponseEntity<RatingResponse> submitRating(@RequestBody @Valid RatingRequest ratingRequest,
                                                 BindingResult result) {
        if(!result.hasErrors()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if(auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                try {
                    UUID raterId = UUID.fromString(auth.getName());
                    RatingResponse rating = ratingServ.submitRating(raterId,ratingRequest);
                    if(rating != null) {
                        return ResponseEntity.ok().body(rating);
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
}
