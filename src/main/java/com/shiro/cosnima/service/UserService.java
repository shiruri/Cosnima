package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.request.UpdateProfileRequest;
import com.shiro.cosnima.dto.response.AuthResult;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.request.UserDto;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.model.Wishlist;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.security.JwtUtils;
import com.shiro.cosnima.utility.ListingMapper;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder encoder;

    public UserService(UserRepository userRepo,CloudinaryService cloudinaryService) {
        this.userRepo = userRepo;
        this.cloudinaryService = cloudinaryService;
        this.encoder = new BCryptPasswordEncoder();

    }

    public List<UserDto> getUsers() {
         return userRepo.findAll().stream()
                 .map(UserDto::fromEntity)
                 .toList();

    }

    public UserDto getUserById(UUID id) {
        User user = userRepo.findUserById(id).orElseThrow(() -> new RuntimeException("User not found"));
        double ratingCount = userRepo.getAverageRatingByUserId(id);
        long listingCount = userRepo.countActiveListingsByUserId(id);


        return UserDto.fromEntity(user,ratingCount,listingCount);
    }


    public UserDto updateUserProfile(UUID id, UpdateProfileRequest userDetails, MultipartFile file) throws IOException {
        User user = userRepo.findUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // --- Update username if provided and changed ---
        if (userDetails.getUsername() != null && !userDetails.getUsername().equals(user.getUsername())) {
            long usernameCount = userRepo.countByUsernameExcludingUser(userDetails.getUsername(), id);
            if (usernameCount > 0) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(userDetails.getUsername());
        }

        // --- Update email if provided and changed ---
        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(user.getEmail())) {
            long emailCount = userRepo.countByEmailExcludingUser(userDetails.getEmail(), id);
            if (emailCount > 0) {
                throw new RuntimeException("Email is already in use");
            }
            user.setEmail(userDetails.getEmail());
        }

        // --- Update bio (always update if present, even if empty) ---
        if (userDetails.getBio() != null) {
            user.setBio(userDetails.getBio());
        }

        // --- Update password if provided ---
        if (userDetails.getNewPassword() != null && !userDetails.getCurrentPassword().isBlank()) {
            if(!encoder.matches(userDetails.getCurrentPassword(), user.getPasswordHash())) {
                user.setPasswordHash(encoder.encode(userDetails.getNewPassword()));
            }
        }

        // --- Handle avatar upload ---
        if (file != null && !file.isEmpty()) {
            if (user.getAvatarPublicId() != null) {
                cloudinaryService.deleteImage(user.getAvatarPublicId());
            }
            Map uploadResult = cloudinaryService.uploadImage(file, "profiles");
            user.setAvatarUrl(uploadResult.get("secure_url").toString());
            user.setAvatarPublicId(uploadResult.get("public_id").toString());
        }

        User updated = userRepo.save(user);
        return UserDto.fromEntity(updated);
    }

    public List<ListingResponse> getUserListingByActive(UUID uuid) {
        return userRepo.getListingsByUserId(uuid).stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());
    }
    public List<Rating> getUserRatings(UUID uuid) {
        return userRepo.getRatingsByUserId(uuid);
    }
    public List<Wishlist> getUserWishlists(UUID uuid) {
        return userRepo.getWishlistByUserId(uuid);

    }






}
