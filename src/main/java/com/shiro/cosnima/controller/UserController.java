package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.request.UpdateProfileRequest;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.request.UserDto;
import com.shiro.cosnima.model.Rating;
import com.shiro.cosnima.model.Wishlist;
import com.shiro.cosnima.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userServ;

    public UserController(UserService userServ) {
        this.userServ = userServ;
    }

    @GetMapping
    public List<UserDto> getUsers() {
        return userServ.getUsers();
    }

    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable UUID id) {
        return userServ.getUserById(id);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getLoggedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            String userId = (auth.getName());
            UserDto user = userServ.getUserById(UUID.fromString(userId));
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.badRequest().build();
    }
    @GetMapping("/{id}/listings")
    public ResponseEntity<List<ListingResponse>> getUserListing(@PathVariable UUID id) {
        List<ListingResponse> listingResponse = userServ.getUserListingByActive(id);
        if (listingResponse != null) {
            return ResponseEntity.ok().body(listingResponse);
        }
        return ResponseEntity.badRequest().build();
    }


    @PatchMapping("/me/update")
    public ResponseEntity<UserDto> updateUser(@RequestPart("value") UpdateProfileRequest user,
                                              @RequestPart(value = "file", required = false) MultipartFile file) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();
        UserDto updated = userServ.updateUserProfile(UUID.fromString(userId), user, file);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/ratings")
    public ResponseEntity<List<Rating>> getUserRatings(@PathVariable UUID id) {
        List<Rating> ratings = userServ.getUserRatings(id);
        if (ratings != null) {
            return ResponseEntity.ok().body(ratings);
        }
        return ResponseEntity.badRequest().build();
    }
    @GetMapping("/{id}/wishlists")
    public ResponseEntity<List<Wishlist>> getUserWishlists(@PathVariable UUID id) {
        List<Wishlist> wishlists = userServ.getUserWishlists(id);
        if (wishlists != null) {
            return ResponseEntity.ok().body(wishlists);
        }
        return ResponseEntity.badRequest().build();
    }

}