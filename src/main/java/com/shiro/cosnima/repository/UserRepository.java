package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.model.Wishlist;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    long countByIsActive(Boolean isActive);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.isActive = :status WHERE u.id = :id")
    int updateIsActive(@Param("id") UUID id, @Param("status") boolean status);

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.seller.id = :userId AND l.isActive = true AND l.status = com.shiro.cosnima.model.Listing.Status.AVAILABLE")
    Long countActiveListingsByUserId(@Param("userId") UUID userId);


    @Query("SELECT l FROM Listing l WHERE l.seller.id = :userId AND l.isActive = true AND l.status = com.shiro.cosnima.model.Listing.Status.AVAILABLE")
    List<Listing> findActiveListingsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.id <> :id")
    long countByEmailExcludingUser(@Param("email") String email, @Param("id") UUID id);

    @Query("SELECT l FROM Listing l WHERE l.seller.id = :userId")
    List<Listing> getListingsByUserId(@Param("userId") UUID userId);


    @Query("SELECT r FROM Rating r WHERE r.ratedUser.id = :userId")
    List<Rating> getRatingsByUserId(@Param("userId") UUID userId);


    @Query("SELECT w FROM Wishlist w WHERE w.user.id = :userId")
    List<Wishlist> getWishlistByUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.username = :username AND u.id <> :id")
    long countByUsernameExcludingUser(@Param("username") String username, @Param("id") UUID id);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findUserById(UUID id);

    // Count listings for a specific user
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.seller.id = :userId")
    Long countListingsByUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(AVG(r.stars), 0.0) FROM Rating r WHERE r.ratedUser.id = :userId")
    double getAverageRatingByUserId(@Param("userId") UUID userId);

}
