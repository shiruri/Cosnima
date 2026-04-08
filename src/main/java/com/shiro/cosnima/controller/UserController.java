package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.UserDto;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.service.UserService;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
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
    public ResponseEntity<UserDto> getLoggedUser(@RequestHeader("Authorization") String authorizationHeader) {
        if(authorizationHeader != null && authorizationHeader.startsWith(("Bearer "))) {
            String token = authorizationHeader.substring(7);
            return ResponseEntity.ok(userServ.getLoggedUserByToken(token));
        }
        return ResponseEntity.badRequest().body(new UserDto());

    }

    @PatchMapping("/me/update")
    public ResponseEntity<UserDto> updateUser(@RequestHeader("Authorization") String authorizationHeader,
                                              @RequestBody UserDto user) {

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);
            return ResponseEntity.ok(userServ.updateUserProfile(token, user));
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}/listings")
    public ResponseEntity<List<ListingResponse>> getUserListing(@PathVariable UUID uuid) {
        List<ListingResponse> listingResponse = userServ.getUserListing(uuid);
        if (listingResponse != null) {
            return ResponseEntity.ok().body(listingResponse);
        }

        return ResponseEntity.badRequest().build();
    }

}

