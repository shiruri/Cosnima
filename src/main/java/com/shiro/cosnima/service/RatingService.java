package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.request.RatingRequest;
import com.shiro.cosnima.dto.response.RatingResponse;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.repository.RatingRepository;
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

    @Autowired
    public RatingService(RatingRepository ratingRepo, UserRepository userRepo) {
        this.ratingRepo = ratingRepo;
        this.userRepo = userRepo;
    }

    public RatingResponse submitRating(UUID raterId, RatingRequest request) {

        Rating.TransactionType type =
                Rating.TransactionType.valueOf(request.getTransactionType().toUpperCase());

        Optional<Rating> existingRating = ratingRepo
                .findByRater_IdAndTransactionIdAndTransactionType(
                        raterId,
                        request.getTransactionId(),
                        type
                );

        if (existingRating.isPresent()) {
            throw new RuntimeException("You already rated this transaction.");
        }

        Rating rating = new Rating();

        rating.setRater(
                userRepo.findById(raterId)
                        .orElseThrow(() -> new RuntimeException("Rater not found"))
        );

        rating.setRatedUser(
                userRepo.findById(request.getRatedUserId())
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
