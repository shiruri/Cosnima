package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.request.CreateListingDto;
import com.shiro.cosnima.dto.request.ImageUpdateMode;
import com.shiro.cosnima.dto.request.ListingRequest;
import com.shiro.cosnima.dto.request.UpdateListingRequest;
import com.shiro.cosnima.dto.response.ImageResponse;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.dto.response.StatsResponse;
import com.shiro.cosnima.dto.response.UserDetailsDto;
import com.shiro.cosnima.model.*;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.ListingViewRepository;
import com.shiro.cosnima.repository.TagRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.utility.ListingMapper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ListingService {

    private final ListingRepository listingRepo;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepo;
    private final TagRepository tagRepo;
    private final ListingViewRepository listingViewRepo;

    public ListingService(ListingRepository listingRepo, CloudinaryService cloudinaryService, UserRepository userRepo, TagRepository tagRepo, ListingViewRepository listingViewRepo) {
        this.listingRepo = listingRepo;
        this.cloudinaryService = cloudinaryService;
        this.userRepo = userRepo;
        this.tagRepo = tagRepo;
        this.listingViewRepo = listingViewRepo;
    }


    public ListingResponse getListingById(String id, UUID userId) {

        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        ListingResponse dto = ListingMapper.toDto(listing);

        boolean isOwner = listing.getSeller().getId().equals(userId);

        dto.setIsOwner(isOwner);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        if (!isOwner && userId != null) {
            boolean alreadyViewed = listingViewRepo.hasUserViewed(id, userId);

            if (!alreadyViewed) {
                listingRepo.incrementViewCount(id);

                listingViewRepo.save(new ListingView(id, userId));
            }
        }


        return dto;
    }



    public List<ListingResponse> getListings(ListingRequest listingRequest) {

        Sort sort = listingRequest.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(listingRequest.getSortBy()).ascending()
                : Sort.by(listingRequest.getSortBy()).descending();

        Pageable pageable = PageRequest.of(
                listingRequest.getPage(),
                listingRequest.getPageSize(),
                sort
        );

        // Convert string values to enums
        Listing.Condition condition = null;
        if (listingRequest.getCondition() != null && !listingRequest.getCondition().isEmpty()) {
            try {
                condition = Listing.Condition.valueOf(listingRequest.getCondition().toUpperCase());
            } catch (IllegalArgumentException e) {}
        }

        Listing.Type type = null;
        if (listingRequest.getType() != null && !listingRequest.getType().isEmpty()) {
            try {
                type = Listing.Type.valueOf(listingRequest.getType().toUpperCase());
            } catch (IllegalArgumentException e) {}
        }

        Listing.Status status = null;
        if (listingRequest.getStatus() != null && !listingRequest.getStatus().isEmpty()) {
            try {
                status = Listing.Status.valueOf(listingRequest.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {}
        }

        Page<Listing> listingPage = listingRepo.getListings(
                listingRequest.getKeyword(),
                listingRequest.getMinPrice(),
                listingRequest.getMaxPrice(),
                condition,
                listingRequest.getIsActive(),
                status,
                type,
                listingRequest.getSize(),
                listingRequest.getSeries(),
                pageable
        );

        List<Listing> listings = listingPage.getContent();

        if (listings.isEmpty()) {
            return List.of();
        }

        List<String> listingIds = listings.stream()
                .map(Listing::getId)
                .collect(Collectors.toList());

        List<ListingImage> images = listingRepo.findImagesByListingIds(listingIds);

        Map<String, List<ListingImage>> imageMap = images.stream()
                .collect(Collectors.groupingBy(img -> img.getListing().getId()));

        return listings.stream()
                .map(listing -> {
                    ListingResponse dto = ListingMapper.toDto(listing);
                    List<ListingImage> imgs = imageMap.getOrDefault(listing.getId(), List.of());
                    dto.setImages(imgs.stream().map(img -> {
                        ImageResponse ir = new ImageResponse();
                        ir.setId(img.getId());
                        ir.setImageUrl(img.getImageUrl());
                        ir.setPublicId(img.getPublicId());
                        ir.setIsPrimary(img.getIsPrimary());
                        ir.setSortOrder(img.getSortOrder());
                        return ir;
                    }).toList());
                    return dto;
                })
                .toList();
    }


    public String postListing(
            CreateListingDto listingReq,
            List<MultipartFile> images,
            UUID sellerId
    ) throws IOException {

        // 🔐 1. GET SELLER
        User seller = userRepo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🧠 2. MAP DTO → ENTITY
        Listing listing = new Listing();

        listing.setSeller(seller);
        listing.setTitle(listingReq.getTitle());
        listing.setDescription(listingReq.getDescription());
        listing.setPrice(listingReq.getPrice());

        listing.setType(
                Listing.Type.valueOf(listingReq.getType().toUpperCase())
        );

        if (listingReq.getCondition() != null) {
            listing.setCondition(
                    Listing.Condition.valueOf(listingReq.getCondition().toUpperCase())
            );
        }

        listing.setSize(listingReq.getSize());
        listing.setCharacterName(listingReq.getCharacterName());
        listing.setSeriesName(listingReq.getSeriesName());
        listing.setLocation(listingReq.getLocation());

        if (listingReq.getConventionPickup() != null) {
            listing.setConventionPickup(listingReq.getConventionPickup());
        }

        // 🖼️ 3. HANDLE IMAGES
        List<ListingImage> imageEntities = new ArrayList<>();

        if (images != null && !images.isEmpty()) {

            for (MultipartFile file : images) {

                Map uploadResult =
                        cloudinaryService.uploadImage(file, "listing_images");

                ListingImage img = new ListingImage();
                img.setImageUrl(uploadResult.get("secure_url").toString());
                img.setPublicId(uploadResult.get("public_id").toString());
                img.setIsPrimary(false);
                img.setSortOrder(imageEntities.size());
                img.setListing(listing);

                imageEntities.add(img);
            }

            // optional: first image = primary
            imageEntities.get(0).setIsPrimary(true);
        }

        listing.setImages(imageEntities);

        List<Tags> tagEntities = new ArrayList<>();

        if (listingReq.getTags() != null) {
            for (String tagName : listingReq.getTags()) {

                Tags tag = tagRepo.findByName(tagName)
                        .orElseGet(() -> {
                            Tags newTag = new Tags();
                            newTag.setName(tagName);
                            return tagRepo.save(newTag);
                        });

                tagEntities.add(tag);
            }
        }

        listing.setTags(tagEntities);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setUpdatedAt(LocalDateTime.now());
        listingRepo.save(listing);
        return listing.getId();
    }


    public ListingResponse updateListing(
            String id,
            UUID userId,
            UpdateListingRequest request,
            List<MultipartFile> files
    ) throws IOException {

        // 1. FETCH LISTING
        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        // 2. OWNERSHIP CHECK
        if (!listing.getSeller().getId().equals(userId)) {
            throw new RuntimeException("Not allowed");
        }

        // 3. UPDATE BASIC FIELDS (PATCH STYLE)
        if (request.getTitle() != null) listing.setTitle(request.getTitle());
        if (request.getDescription() != null) listing.setDescription(request.getDescription());
        if (request.getPrice() != null) listing.setPrice(request.getPrice());
        if (request.getType() != null) listing.setType(Listing.Type.valueOf(request.getType()));
        if (request.getCondition() != null) listing.setCondition(Listing.Condition.valueOf(request.getCondition()));
        if (request.getSize() != null) listing.setSize(request.getSize());
        if (request.getCharacterName() != null) listing.setCharacterName(request.getCharacterName());
        if (request.getSeriesName() != null) listing.setSeriesName(request.getSeriesName());
        if (request.getLocation() != null) listing.setLocation(request.getLocation());
        if (request.getConventionPickup() != null)
            listing.setConventionPickup(request.getConventionPickup());

        // =====================================================
        // 4. IMAGE LOGIC (FULL FIX)
        // =====================================================
        if (files != null && !files.isEmpty()) {

         ImageUpdateMode mode = request.getImageMode();

            // DEFAULT SAFETY: ADD
            if (mode == null) mode = ImageUpdateMode.ADD;

            // -----------------------------------------------------
            // REPLACE MODE
            // -----------------------------------------------------
            if (mode == ImageUpdateMode.REPLACE) {

                // delete old cloudinary images
                for (ListingImage img : listing.getImages()) {
                    if (img.getPublicId() != null) {
                        cloudinaryService.deleteImage(img.getPublicId());
                    }
                }

                listing.getImages().clear();
            }

            // -----------------------------------------------------
            // ADD MODE (or after replace)
            // -----------------------------------------------------
            for (MultipartFile file : files) {

                Map uploadResult =
                        cloudinaryService.uploadImage(file, "listing_images");

                ListingImage img = new ListingImage();
                img.setImageUrl(uploadResult.get("secure_url").toString());
                img.setPublicId(uploadResult.get("public_id").toString());
                img.setIsPrimary(false);
                img.setSortOrder(listing.getImages().size());
                img.setListing(listing);

                listing.getImages().add(img);
            }
        }


        // 5. SAVE
        Listing saved = listingRepo.save(listing);

        // 6. MAP RESPONSE
        ListingResponse dto = ListingMapper.toDto(saved);

        boolean isOwner = true;
        dto.setIsOwner(isOwner);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        return dto;
    }

    public void deleteListing(String id, UUID userId) {
        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if(!listing.getSeller().getId().equals(userId)) {
            throw new RuntimeException("No Permission To Delete");
        }
        listingRepo.deleteById(id);


    }

    public ListingResponse updateStatus(String id, UUID userId, String status) throws AccessDeniedException {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (!listing.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("Not owner");
        }

        listing.setStatus(Listing.Status.valueOf(status.toUpperCase()));

        Listing saved = listingRepo.save(listing);

        return ListingMapper.toDto(saved);
    }

    public Boolean isAvailable(String id, String startDate, String endDate) {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        // Example logic (replace with real booking table later)
        return listing.getStatus() == Listing.Status.AVAILABLE;
    }

    public StatsResponse getStats() {
        long listingCount = listingRepo.countAllListings();
        long sellerCount = userRepo.count();
        return new StatsResponse(listingCount, sellerCount);
    }

    public String getUserImage(String id) {
        return listingRepo.findById(id)
                .map(Listing::getSeller)
                .map(User::getAvatarUrl)
                .orElse(null);
    }

    public UserDetailsDto getUserDetails(String id) {
        User user = listingRepo.findById(id)
                .map(Listing::getSeller).orElse(null);

        assert user != null;
        int ratings = userRepo.getAverageRatingByUserId(user.getId());
        LocalDateTime dateJoined = user.getCreatedAt();
        return new UserDetailsDto(ratings,dateJoined);

    }
}
