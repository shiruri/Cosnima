package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.request.CreateListingDto;
import com.shiro.cosnima.dto.request.ImageUpdateMode;
import com.shiro.cosnima.dto.request.ListingRequest;
import com.shiro.cosnima.dto.request.UpdateListingRequest;
import com.shiro.cosnima.dto.response.ImageResponse;
import com.shiro.cosnima.dto.response.ListingResponse;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.ListingImage;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.utility.ListingMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@Service
@Transactional
public class ListingService {

    private final ListingRepository listingRepo;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public ListingService(ListingRepository listingRepo, CloudinaryService cloudinaryService) {
        this.listingRepo = listingRepo;
        this.cloudinaryService = cloudinaryService;
    }


    public ListingResponse getListingById(Long id, UUID userId) {

        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        ListingResponse dto = ListingMapper.toDto(listing);

        boolean isOwner = listing.getSeller().getId().equals(userId);

        dto.setIsOwner(isOwner);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        return dto;
    }



    public List<ListingResponse> getListings(ListingRequest listingRequest) {

        Sort sort = listingRequest.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(listingRequest.getSortBy()).ascending()
                : Sort.by(listingRequest.getSortBy()).descending();

        Pageable pageable = PageRequest.of(
                listingRequest.getPage(),
                listingRequest.getSize(),
                sort
        );

        // 1. get paginated listings
        Page<Listing> listingPage = listingRepo.getListings(
                listingRequest.getKeyword(),
                listingRequest.getCategory(),
                listingRequest.getMinPrice(),
                listingRequest.getMaxPrice(),
                listingRequest.getCondition(),
                listingRequest.getIsAvailable(),
                pageable
        );

        List<Listing> listings = listingPage.getContent();

        // 2. extract listing IDs
        List<Long> listingIds = listings.stream()
                .map(Listing::getId)
                .toList();

        // 3. fetch all images in ONE query
        List<ListingImage> images = listingRepo.findImagesByListingIds(listingIds);

        // 4. group images by listingId
        Map<Long, List<ListingImage>> imageMap = images.stream()
                .collect(Collectors.groupingBy(img -> img.getListing().getId()));

        // 5. map to DTO
        return listings.stream()
                .map(listing -> {
                    ListingResponse dto = ListingMapper.toDto(listing);

                    List<ListingImage> imgs = imageMap.getOrDefault(listing.getId(), List.of());

                    dto.setImages(
                            imgs.stream().map(img -> {
                                ImageResponse ir = new ImageResponse();
                                ir.setId(img.getId());
                                ir.setImageUrl(img.getImageUrl());
                                ir.setPublicId(img.getPublicId());
                                ir.setIsPrimary(img.getIsPrimary());
                                ir.setSortOrder(img.getSortOrder());
                                return ir;
                            }).toList()
                    );

                    return dto;
                })
                .toList();
    }

    public void postListing(CreateListingDto listingReq) throws IOException {

        List<ListingImage> imageEntities = new ArrayList<>();

        if (listingReq.getImages() != null) {

            for (MultipartFile file : listingReq.getImages()) {

                // 1. upload to cloudinary
                Map uploadResult =
                        cloudinaryService.uploadImage(file, "listing_images");

                String imageUrl = (String) uploadResult.get("secure_url");
                String publicId = (String) uploadResult.get("public_id");

                ListingImage img = new ListingImage();
                img.setImageUrl(imageUrl);
                img.setPublicId(publicId);
                img.setIsPrimary(false);
                img.setSortOrder(0);

                imageEntities.add(img);

            }
        }

        // 3. create listing
        Listing listing = new Listing();
        listing.setImages(imageEntities);

        imageEntities.forEach(img -> img.setListing(listing));

        listingRepo.save(listing);
    }
    public ListingResponse updateListing(
            Long id,
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

    public void deleteListing(long id, UUID userId) {
        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));

        if(!listing.getSeller().getId().equals(userId)) {
            throw new RuntimeException("No Permission To Delete");
        }
        listingRepo.deleteById(id);


    }

    public ListingResponse updateStatus(Long id, UUID userId, String status) throws AccessDeniedException {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (!listing.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("Not owner");
        }

        listing.setStatus(Listing.Status.valueOf(status.toUpperCase()));

        Listing saved = listingRepo.save(listing);

        return ListingMapper.toDto(saved);
    }

    public Boolean isAvailable(Long id, String startDate, String endDate) {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        // Example logic (replace with real booking table later)
        return listing.getStatus() == Listing.Status.AVAILABLE;
    }



}
