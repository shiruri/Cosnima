package com.shiro.cosnima.controller;


import com.shiro.cosnima.dto.request.*;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.service.ListingService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/listings/")
public class ListingController {

    private final ListingService listingServ;

    @Autowired
    public ListingController(ListingService listingServ) {
        this.listingServ = listingServ;
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<Boolean> checkAvailability(
            @PathVariable Long id,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {

        return ResponseEntity.ok(
                listingServ.isAvailable(id, startDate, endDate)
        );
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) throws AccessDeniedException {

        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );

        return ResponseEntity.ok(
                listingServ.updateStatus(id, userId, status)
        );
    }


    @GetMapping("/{id}/listings")
    public ResponseEntity<ListingResponse> getListingById(@PathVariable long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            UUID userId = UUID.fromString(auth.getName());
            ListingResponse listingResponse = listingServ.getListingById(id,userId);
            if (listingResponse != null) {
                return ResponseEntity.ok().body(listingResponse);
            }
            return ResponseEntity.badRequest().build();

        }
        ListingResponse listingResponse = listingServ.getListingById(id,null);

        return ResponseEntity.ok().body(listingResponse);
    }

    @PatchMapping("/update/{id}")
    public ResponseEntity<ListingResponse> updateListing(
            @PathVariable Long id,
            @RequestPart("value") UpdateListingRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {

        UUID userId = UUID.fromString(
                SecurityContextHolder.getContext().getAuthentication().getName()
        );

        ListingResponse updated = listingServ.updateListing(id, userId, request, files);

        return ResponseEntity.ok(updated);
    }


    @GetMapping()
    public ResponseEntity<List<ListingResponse>> getListings(@RequestParam ListingRequest listingReq) {
        List<ListingResponse> listingResponse = listingServ.getListings(listingReq);
        if(listingResponse != null) {
            return ResponseEntity.ok().body(listingResponse);
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/post")
    public ResponseEntity<String> postListing(
            @RequestPart("value") @Valid CreateListingDto listingReq,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            BindingResult result) throws IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        UUID sellerId;

        try {
            sellerId = UUID.fromString(auth.getName());
            listingServ.postListing(listingReq,images,sellerId);
            return ResponseEntity.ok().body("Posted Succesfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Invalid user ID");
        }
    }


        @DeleteMapping("/{id}") ResponseEntity<String> deleteListing(@PathVariable long id) throws IOException{
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if(auth != null) {
            UUID userId = UUID.fromString(auth.getName());
            listingServ.deleteListing(id,userId);
            return ResponseEntity.ok().body("Successfully Deleted");
        }
        return ResponseEntity.badRequest().build();
    }



}