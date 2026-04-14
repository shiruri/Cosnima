package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RatingRepository extends JpaRepository<Rating,Long> {

    Optional<Rating> findByRater_IdAndTransactionIdAndTransactionType(
            UUID raterId,
            String transactionId,
            Rating.TransactionType transactionType
    );

    List<Rating> findByRatedUser_Id(UUID ratedUserId);
}
