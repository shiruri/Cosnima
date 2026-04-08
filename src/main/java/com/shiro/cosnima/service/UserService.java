package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.UserDto;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.security.JwtUtils;
import com.shiro.cosnima.utility.ListingMapper;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepo;
    private final JwtUtils jwtUtils;

    public UserService(UserRepository userRepo, JwtUtils jwtUtils) {
        this.userRepo = userRepo;
        this.jwtUtils = jwtUtils;
    }

    public List<UserDto> getUsers() {
         return userRepo.findAll().stream()
                 .map(UserDto::fromEntity)
                 .toList();

    }

    public UserDto getUserById(UUID id) {
        User user = userRepo.findUserById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return UserDto.fromEntity(user);
    }

    public UserDto getLoggedUserByToken(String token) {
       User user = userRepo.findByUsername(jwtUtils.extractUsername(token)).orElseThrow( () ->
                 new RuntimeException("Invalid User")
         );

         return UserDto.fromEntity(user);
    }

    public UserDto updateUserProfile(String username, UserDto userDetails) {
        username = jwtUtils.extractUsername(username);
        System.out.println(username);
        Optional<User> userOpt = userRepo.findByUsername(username);

        if(userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOpt.get();

        // Check if the new email is already taken by another user
        long emailCount = userRepo.countByEmailExcludingUser(userDetails.getEmail(), username);
        if(emailCount > 0) {
            throw new RuntimeException("Email is already in use by another account");
        }

        // Optional: check username if user can change it
        long usernameCount = userRepo.countByUsernameExcludingUser(userDetails.getUsername(), username);
        if(usernameCount > 0) {
            throw new RuntimeException("Username is already taken");
        }

        // Update fields
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setBio(userDetails.getBio());
        user.setAvatarUrl(userDetails.getAvatarUrl());

        User updated = userRepo.save(user);

        return UserDto.fromEntity(updated);
    }
    public List<ListingResponse> getUserListing(UUID uuid) {
        return userRepo.getListingsByUserId(uuid).stream()
                .map(ListingMapper::toDto)
                .collect(Collectors.toList());
    }






}
