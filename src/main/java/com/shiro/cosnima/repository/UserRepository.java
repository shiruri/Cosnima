package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Query("UPDATE User u SET u.isActive = :status WHERE u.username = :username")
    int updateIsActive(@Param("username") String username, @Param("status") boolean status);


    @Query("SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.username <> :username")
    long countByEmailExcludingUser(@Param("email") String email, @Param("username") String username);

    @Query("SELECT l FROM Listing l WHERE l.seller.id = :userId")
    List<Listing> getListingsByUserId(@Param("userId") UUID userId);

    // Count listings for a specific user
    @Query("SELECT COUNT(l) FROM Listing l WHERE l.seller.id = :userId")
    Long countListingsByUserId(@Param("userId") UUID userId);


    @Query("SELECT COUNT(u) FROM User u WHERE u.username = :username AND u.username <> :currentUsername")
    long countByUsernameExcludingUser(@Param("username") String username, @Param("currentUsername") String currentUsername);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findUserById(UUID id);
}
