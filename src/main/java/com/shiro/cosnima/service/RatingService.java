package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.request.RatingRequest;
import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.model.*;
import com.shiro.cosnima.repository.OffersRepository;
import com.shiro.cosnima.repository.RatingRepository;
import com.shiro.cosnima.repository.RentalRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.utility.RatingMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Transactional
@Service
public class RatingService {

    private final RatingRepository ratingRepo;
    private final UserRepository userRepo;
    private final OffersRepository offerRepo;
    private final RentalRepository rentalRepo;

    @Autowired
    public RatingService(RatingRepository ratingRepo, UserRepository userRepo, OffersRepository offerRepo, RentalRepository rentalRepo) {
        this.ratingRepo = ratingRepo;
        this.userRepo = userRepo;
        this.offerRepo = offerRepo;
        this.rentalRepo = rentalRepo;
    }

    public RatingResponse submitRating(UUID raterId, RatingRequest request) {

        Rating.TransactionType type =
                Rating.TransactionType.valueOf(request.getTransactionType().toUpperCase());

        // Prevent self-rating
        if (request.getRatedUserId().equals(raterId)) {
            throw new RuntimeException("You cannot rate yourself.");
        }

        UUID validRatedUserId = null;

        // Validate transaction source
        if (type == Rating.TransactionType.SALE) {

            Offer offer = offerRepo.findById(UUID.fromString(request.getTransactionId()))
                    .orElseThrow(() -> new RuntimeException("Offer not found"));

            // Must be accepted
            if (offer.getStatus() != OfferStatus.ACCEPTED) {
                throw new RuntimeException("Offer is not accepted.");
            }

            UUID buyerId = offer.getBuyer().getId();
            UUID sellerId = offer.getListing().getSeller().getId();

            // Must be part of transaction
            if (!buyerId.equals(raterId) && !sellerId.equals(raterId)) {
                throw new RuntimeException("You are not part of this transaction.");
            }

            // Determine correct rated user
            validRatedUserId = buyerId.equals(raterId) ? sellerId : buyerId;

        } else if (type == Rating.TransactionType.RENTAL) {

            Rental rental = rentalRepo.findById(Long.getLong(request.getTransactionId()))
                    .orElseThrow(() -> new RuntimeException("Rental not found"));

            // Must be completed
            if (rental.getStatus() != RentalStatus.COMPLETED) {
                throw new RuntimeException("Rental is not completed.");
            }

            UUID renterId = rental.getRenter().getId();
            UUID sellerId = rental.getListing().getSeller().getId();

            // Must be part of transaction
            if (!renterId.equals(raterId) && !sellerId.equals(raterId)) {
                throw new RuntimeException("You are not part of this rental.");
            }

            validRatedUserId = renterId.equals(raterId) ? sellerId : renterId;
        }

        // Ensure correct rated user
        if (!request.getRatedUserId().equals(validRatedUserId)) {
            throw new RuntimeException("Invalid rated user.");
        }

        // Prevent duplicate rating
        Optional<Rating> existingRating = ratingRepo
                .findByRater_IdAndTransactionIdAndTransactionType(
                        raterId,
                        request.getTransactionId(),
                        type
                );

        if (existingRating.isPresent()) {
            throw new RuntimeException("You already rated this transaction.");
        }

        // Create rating
        Rating rating = new Rating();

        rating.setRater(
                userRepo.findById(raterId)
                        .orElseThrow(() -> new RuntimeException("Rater not found"))
        );

        rating.setRatedUser(
                userRepo.findById(validRatedUserId)
                        .orElseThrow(() -> new RuntimeException("Rated user not found"))
        );

        rating.setStars(request.getStars());
        rating.setComment(request.getComment());
        rating.setTransactionType(type);
        rating.setTransactionId(request.getTransactionId());

        Rating saved = ratingRepo.save(rating);

        return RatingMapper.toDto(saved);
    }



    public List<RatingResponse> getUserRatings(UUID uuid) {
        return ratingRepo.findByRatedUser_Id(uuid).stream().map(RatingMapper::toDto).toList();
    }
}
