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
import com.shiro.cosnima.repository.*;
import com.shiro.cosnima.utility.ListingMapper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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
    private final RentalRepository rentalRepo;
    private final TagRepository tagRepo;
    private final OffersRepository offerRepo;
    private final ListingViewRepository listingViewRepo;
    private final RatingRepository ratingRepo;

    public ListingService(
            ListingRepository listingRepo,
            CloudinaryService cloudinaryService,
            UserRepository userRepo,
            RentalRepository rentalRepo,
            TagRepository tagRepo,
            OffersRepository offerRepo,
            ListingViewRepository listingViewRepo,
            RatingRepository ratingRepo
    ) {
        this.listingRepo = listingRepo;
        this.cloudinaryService = cloudinaryService;
        this.userRepo = userRepo;
        this.rentalRepo = rentalRepo;
        this.tagRepo = tagRepo;
        this.offerRepo = offerRepo;
        this.listingViewRepo = listingViewRepo;
        this.ratingRepo = ratingRepo;
    }

    // =====================================================
    // GET ONE
    // =====================================================

    public ListingResponse getListingById(String id, UUID userId) {

        Listing listing = listingRepo.findByIdWithImages(id)
                .orElseThrow(() -> ApiException.notFound("Listing not found"));

        ListingResponse dto = ListingMapper.toDto(listing);

        boolean isOwner =
                userId != null &&
                        listing.getSeller().getId().equals(userId);

        dto.setIsOwner(isOwner);
        dto.setCanEdit(isOwner);
        dto.setCanDelete(isOwner);

        if (!isOwner && userId != null) {

            boolean viewed =
                    listingViewRepo.hasUserViewed(
                            id,
                            userId
                    );

            if (!viewed) {
                listingRepo.incrementViewCount(id);
                listingViewRepo.save(
                        new ListingView(id, userId)
                );
            }
        }

        return dto;
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.toLowerCase().trim();
    }


    // =====================================================
    // GET MANY
    // =====================================================
    public List<ListingResponse> getListings(ListingRequest request) {

        Sort sort = request.getSortDir().equalsIgnoreCase("asc")
                ? Sort.by(request.getSortBy()).ascending()
                : Sort.by(request.getSortBy()).descending();

        Pageable pageable = PageRequest.of(request.getPage(), request.getPageSize(), sort);

// ==============================
// 1. SAFE NORMALIZATION (IMPORTANT FIX)
// ==============================
        String keyword = normalize(request.getKeyword());
        String series = normalize(request.getSeries());

// Parse enums safely
        Listing.Condition condition = parseCondition(request.getCondition());
        Listing.Type type = parseType(request.getType());
        Listing.Status status = parseStatus(request.getStatus());

// ==============================
// 2. CALL REPOSITORY (NO LOWER() IN DB)
// ==============================
        Page<Listing> page = listingRepo.getListings(
                keyword,
                request.getMinPrice(),
                request.getMaxPrice(),
                condition,
                request.getIsActive(),
                status,
                type,
                request.getSize(),
                series,
                pageable
        );


        List<Listing> listings = page.getContent();

        if (listings.isEmpty()) {
            return List.of();
        }

        List<String> ids = listings.stream()
                .map(Listing::getId)
                .toList();

        List<ListingImage> images = listingRepo.findImagesByListingIds(ids);

        Map<String, List<ListingImage>> imageMap = images.stream()
                .collect(Collectors.groupingBy(i -> i.getListing().getId()));

        return listings.stream()
                .map(listing -> {
                    ListingResponse dto = ListingMapper.toDto(listing);
                    List<ListingImage> imgs = imageMap.getOrDefault(listing.getId(), List.of());
                    dto.setImages(imgs.stream().map(this::mapImage).toList());
                    return dto;
                })
                .toList();
    }
    // =====================================================
    // CREATE
    // =====================================================

    public String postListing(
            CreateListingDto req,
            List<MultipartFile> files,
            UUID sellerId
    ) throws IOException {

        User seller =
                userRepo.findById(sellerId)
                        .orElseThrow(() ->
                                ApiException.notFound("User not found"));

        validateCreate(req, files);

        Listing listing = new Listing();

        listing.setSeller(seller);
        listing.setTitle(req.getTitle().trim());
        listing.setDescription(req.getDescription().trim());
        listing.setPrice(req.getPrice());
        listing.setType(
                Listing.Type.valueOf(
                        req.getType().trim().toUpperCase()
                )
        );

        if (req.getCondition() != null) {
            listing.setCondition(
                    Listing.Condition.valueOf(
                            req.getCondition()
                                    .trim()
                                    .toUpperCase()
                    )
            );
        }

        listing.setSize(req.getSize());
        listing.setCharacterName(req.getCharacterName());
        listing.setSeriesName(req.getSeriesName());
        listing.setLocation(req.getLocation());
        listing.setConventionPickup(
                req.getConventionPickup()
        );

        listing.setStatus(Listing.Status.AVAILABLE);
        listing.setCreatedAt(LocalDateTime.now());
        listing.setUpdatedAt(LocalDateTime.now());

        // images
        List<ListingImage> images =
                new ArrayList<>();

        for (MultipartFile file : files) {

            Map upload =
                    cloudinaryService.uploadImage(
                            file,
                            "listing_images"
                    );

            ListingImage img =
                    new ListingImage();

            img.setImageUrl(
                    upload.get("secure_url").toString()
            );

            img.setPublicId(
                    upload.get("public_id").toString()
            );

            img.setIsPrimary(images.isEmpty());
            img.setSortOrder(images.size());
            img.setListing(listing);

            images.add(img);
        }

        listing.setImages(images);

        // tags
        List<Tags> tags = new ArrayList<>();

        if (req.getTags() != null) {

            for (String tagName : req.getTags()) {

                if (tagName == null ||
                        tagName.isBlank()) {
                    continue;
                }

                Tags tag =
                        tagRepo.findByName(tagName.trim())
                                .orElseGet(() -> {

                                    Tags t =
                                            new Tags();

                                    t.setName(
                                            tagName.trim()
                                    );

                                    return tagRepo.save(t);
                                });

                tags.add(tag);
            }
        }

        listing.setTags(tags);

        listingRepo.save(listing);

        return listing.getId();
    }

    // =====================================================
    // UPDATE FULL
    // =====================================================

    public ListingResponse updateListing(
            String id,
            UUID userId,
            UpdateListingRequest request,
            List<MultipartFile> files
    ) throws IOException {

        Listing listing =
                listingRepo.findByIdWithImages(id)
                        .orElseThrow(() ->
                                ApiException.notFound("Listing not found"));

        validateOwner(listing, userId);

        if (listing.getStatus() ==
                Listing.Status.ARCHIVED) {

            throw ApiException.badRequest(
                    "Archived listing cannot be edited"
            );
        }

        // title
        if (request.getTitle() != null) {

            String title =
                    request.getTitle().trim();

            if (title.isBlank()) {
                throw ApiException.badRequest(
                        "Title required"
                );
            }

            if (title.length() > 120) {
                throw ApiException.badRequest(
                        "Title too long"
                );
            }

            listing.setTitle(title);
        }

        // desc
        if (request.getDescription() != null) {

            if (request.getDescription()
                    .length() > 3000) {

                throw ApiException.badRequest(
                        "Description too long"
                );
            }

            listing.setDescription(
                    request.getDescription()
                            .trim()
            );
        }

        // price
        if (request.getPrice() != null) {

            if (request.getPrice()
                    .doubleValue() <= 0) {

                throw ApiException.badRequest(
                        "Price must be greater than zero"
                );
            }

            listing.setPrice(
                    request.getPrice()
            );
        }

        // TYPE CHANGE (old updateStatus logic)
        if (request.getType() != null) {

            Listing.Type newType =
                    Listing.Type.valueOf(
                            request.getType()
                                    .trim()
                                    .toUpperCase()
                    );

            validateTypeChange(
                    listing,
                    newType
            );

            listing.setType(newType);
        }

        // condition
        if (request.getCondition() != null) {

            listing.setCondition(
                    Listing.Condition.valueOf(
                            request.getCondition()
                                    .trim()
                                    .toUpperCase()
                    )
            );
        }

        if (request.getSize() != null)
            listing.setSize(
                    request.getSize().trim()
            );

        if (request.getCharacterName() != null)
            listing.setCharacterName(
                    request.getCharacterName()
                            .trim()
            );

        if (request.getSeriesName() != null)
            listing.setSeriesName(
                    request.getSeriesName()
                            .trim()
            );

        if (request.getLocation() != null)
            listing.setLocation(
                    request.getLocation()
                            .trim()
            );

        if (request.getConventionPickup() != null)
            listing.setConventionPickup(
                    request.getConventionPickup()
            );

        // IMAGES
        updateImages(
                listing,
                request.getImageMode(),
                files
        );

        listing.setUpdatedAt(
                LocalDateTime.now()
        );

        Listing saved =
                listingRepo.save(listing);

        ListingResponse dto =
                ListingMapper.toDto(saved);

        dto.setIsOwner(true);
        dto.setCanEdit(true);
        dto.setCanDelete(true);

        return dto;
    }

    // =====================================================
    // DELETE
    // =====================================================

    public void deleteListing(
            String id,
            UUID userId
    ) {

        Listing listing =
                listingRepo.findById(id)
                        .orElseThrow(() ->
                                ApiException.notFound(
                                        "Listing not found"
                                ));

        validateOwner(listing, userId);

        listing.setStatus(
                Listing.Status.ARCHIVED
        );

        listingRepo.save(listing);
    }
    public ListingResponse updateStatus(String id, UUID userId, String status) {

        Listing listing = listingRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Listing not found"));

        // 1. Authorization
        if (!listing.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("Not owner");
        }

        // 2. Parse target status
        Listing.Status newStatus;
        try {
            newStatus = Listing.Status.valueOf(status.trim().toUpperCase());
        } catch (Exception e) {
            throw ApiException.badRequest("Invalid status value");
        }

        Listing.Status current = listing.getStatus();

        // 3. No change
        if (current == newStatus) {
            throw ApiException.badRequest("Listing is already in this status");
        }

        // 4. Archived listings are immutable
        if (current == Listing.Status.ARCHIVED) {
            throw ApiException.conflict("Archived listings cannot be modified");
        }

        Listing.Type type = listing.getType();

        // =====================================================
        // TYPE‑BASED RESTRICTIONS
        // =====================================================
        if (type == Listing.Type.SELL && newStatus == Listing.Status.RENTED) {
            throw ApiException.badRequest("A SELL listing cannot become RENTED");
        }
        if (type == Listing.Type.RENT && newStatus == Listing.Status.SOLD) {
            throw ApiException.badRequest("A RENT listing cannot become SOLD");
        }

        // =====================================================
        // TRANSITION‑SPECIFIC VALIDATION
        // =====================================================

        // ----- SOLD -----
        if (newStatus == Listing.Status.SOLD) {
            if (type != Listing.Type.SELL) {
                throw ApiException.badRequest("Only SELL listings can be marked SOLD");
            }
            boolean hasAcceptedOffer = offerRepo.existsByListing_IdAndStatus(
                    listing.getId(), OfferStatus.ACCEPTED);
            if (!hasAcceptedOffer) {
                throw ApiException.conflict("Cannot mark SOLD without an accepted offer");
            }
        }

        // ----- RENTED -----
        if (newStatus == Listing.Status.RENTED) {
            if (type != Listing.Type.RENT) {
                throw ApiException.badRequest("Only RENT listings can be marked RENTED");
            }
            // Check for any rental that overlaps with today or future
            boolean hasActiveOrFutureRental = rentalRepo.existsOverlap(
                    listing.getId(),
                    LocalDate.now(),
                    LocalDate.now().plusYears(100) // far future
            );
            if (hasActiveOrFutureRental) {
                throw ApiException.conflict("Cannot mark RENTED due to existing or future bookings");
            }
        }

        // ----- AVAILABLE (reset) -----
        if (newStatus == Listing.Status.AVAILABLE) {
            if (type == Listing.Type.SELL) {
                // Prevent reset if there is an accepted offer (the sale is done)
                boolean hasAcceptedOffer = offerRepo.existsByListing_IdAndStatus(
                        listing.getId(), OfferStatus.ACCEPTED);
                if (hasAcceptedOffer) {
                    throw ApiException.conflict("Cannot set AVAILABLE because the listing has been sold (accepted offer exists)");
                }

                // Prevent reset if any rating has been given for this sale
                boolean hasSaleRating = offerRepo.findAllByListingId(listing.getId()).stream()
                        .anyMatch(offer -> ratingRepo.existsByTransactionIdAndTransactionType(
                                offer.getId().toString(),
                                Rating.TransactionType.SALE));
                if (hasSaleRating) {
                    throw ApiException.conflict("Cannot set AVAILABLE because the sale has already been rated");
                }
            }

            if (type == Listing.Type.RENT) {
                // Check for any rental period that is still active or future
                boolean hasActiveOrFutureRental = rentalRepo.existsOverlap(
                        listing.getId(),
                        LocalDate.now(),
                        LocalDate.now().plusYears(100)
                );
                if (hasActiveOrFutureRental) {
                    throw ApiException.conflict("Cannot set AVAILABLE due to active or future rentals");
                }

                // Prevent reset if any rental has been rated
                boolean hasRentalRating = rentalRepo.findAllByListingId(listing.getId()).stream()
                        .anyMatch(rental -> ratingRepo.existsByTransactionIdAndTransactionType(
                                String.valueOf(rental.getId()),
                                Rating.TransactionType.RENTAL));
                if (hasRentalRating) {
                    throw ApiException.conflict("Cannot set AVAILABLE because the rental has already been rated");
                }
            }
        }

        // ----- ARCHIVED (soft delete) -----
        // This is handled by a separate delete endpoint, but if you allow it here:
        // if (newStatus == Listing.Status.ARCHIVED) { ... }

        // Apply the change
        listing.setStatus(newStatus);
        listing.setUpdatedAt(LocalDateTime.now());

        return ListingMapper.toDto(listingRepo.save(listing));
    }

    // =====================================================
    // STATS
    // =====================================================

    public StatsResponse getStats() {

        return new StatsResponse(
                listingRepo.countAllListings(),
                userRepo.count()
        );
    }

    public String getUserImage(String id) {

        return listingRepo.findById(id)
                .map(Listing::getSeller)
                .map(User::getAvatarUrl)
                .orElse(null);
    }

    public UserDetailsDto getUserDetails(
            String id
    ) {

        User user =
                listingRepo.findById(id)
                        .map(Listing::getSeller)
                        .orElseThrow(() ->
                                ApiException.notFound(
                                        "User not found"
                                ));

        double ratings =
                userRepo.getAverageRatingByUserId(
                        user.getId()
                );

        return new UserDetailsDto(
                (int) Math.round(ratings),
                user.getCreatedAt()
        );
    }

    // =====================================================
    // PRIVATE HELPERS
    // =====================================================

    private void validateOwner(
            Listing listing,
            UUID userId
    ) {
        if (!listing.getSeller()
                .getId()
                .equals(userId)) {

            throw ApiException.forbidden(
                    "Not allowed"
            );
        }
    }

    private void validateTypeChange(
            Listing listing,
            Listing.Type newType
    ) {

        Listing.Type current =
                listing.getType();

        if (current == newType) {
            return;
        }

        if (listing.getStatus() ==
                Listing.Status.SOLD) {

            throw ApiException.conflict(
                    "Sold listing cannot change type"
            );
        }

        if (current ==
                Listing.Type.SELL &&
                newType ==
                        Listing.Type.RENT) {

            boolean offers =
                    offerRepo.existsByListing_IdAndStatus(
                            listing.getId(),
                            OfferStatus.PENDING
                    ) ||
                            offerRepo.existsByListing_IdAndStatus(
                                    listing.getId(),
                                    OfferStatus.ACCEPTED
                            );

            if (offers) {
                throw ApiException.conflict(
                        "Cannot switch to RENT while offers exist"
                );
            }
        }

        if (current ==
                Listing.Type.RENT &&
                newType ==
                        Listing.Type.SELL) {

            boolean rentals =
                    rentalRepo.existsActiveRentals(
                            listing.getId(),
                            LocalDate.now()
                    );

            if (rentals) {
                throw ApiException.conflict(
                        "Cannot switch to SELL while rentals exist"
                );
            }
        }
    }

    private void updateImages(
            Listing listing,
            ImageUpdateMode mode,
            List<MultipartFile> files
    ) throws IOException {

        if (files == null ||
                files.isEmpty()) {
            return;
        }

        if (mode == null) {
            mode = ImageUpdateMode.ADD;
        }

        if (mode ==
                ImageUpdateMode.REPLACE) {

            for (ListingImage img :
                    listing.getImages()) {

                if (img.getPublicId() != null) {
                    cloudinaryService.deleteImage(
                            img.getPublicId()
                    );
                }
            }

            listing.getImages().clear();
        }

        for (MultipartFile file : files) {

            if (file.isEmpty()) {
                continue;
            }

            Map upload =
                    cloudinaryService.uploadImage(
                            file,
                            "listing_images"
                    );

            ListingImage img =
                    new ListingImage();

            img.setImageUrl(
                    upload.get("secure_url")
                            .toString()
            );

            img.setPublicId(
                    upload.get("public_id")
                            .toString()
            );

            img.setIsPrimary(
                    listing.getImages().isEmpty()
            );

            img.setSortOrder(
                    listing.getImages().size()
            );

            img.setListing(listing);

            listing.getImages().add(img);
        }
    }

    private void validateCreate(
            CreateListingDto req,
            List<MultipartFile> files
    ) {

        if (req.getTitle() == null ||
                req.getTitle().isBlank()) {
            throw ApiException.badRequest(
                    "Title required"
            );
        }

        if (req.getPrice() == null ||
                req.getPrice().doubleValue() <= 0) {
            throw ApiException.badRequest(
                    "Invalid price"
            );
        }

        if (files == null ||
                files.isEmpty()) {
            throw ApiException.badRequest(
                    "At least one image required"
            );
        }
    }

    private ImageResponse mapImage(
            ListingImage img
    ) {

        ImageResponse dto =
                new ImageResponse();

        dto.setId(img.getId());
        dto.setImageUrl(
                img.getImageUrl()
        );
        dto.setPublicId(
                img.getPublicId()
        );
        dto.setIsPrimary(
                img.getIsPrimary()
        );
        dto.setSortOrder(
                img.getSortOrder()
        );

        return dto;
    }

    private Listing.Type parseType(
            String v
    ) {
        try {
            return v == null ? null :
                    Listing.Type.valueOf(
                            v.toUpperCase()
                    );
        } catch (Exception e) {
            return null;
        }
    }

    private Listing.Status parseStatus(
            String v
    ) {
        try {
            return v == null ? null :
                    Listing.Status.valueOf(
                            v.toUpperCase()
                    );
        } catch (Exception e) {
            return null;
        }
    }

    private Listing.Condition parseCondition(
            String v
    ) {
        try {
            return v == null ? null :
                    Listing.Condition.valueOf(
                            v.toUpperCase()
                    );
        } catch (Exception e) {
            return null;
        }
    }

    public Boolean isAvailable(
            String id,
            String startDate,
            String endDate
    ) {

        // =====================================================
        // 1. FETCH LISTING
        // =====================================================
        Listing listing = listingRepo.findById(id)
                .orElseThrow(() ->
                        ApiException.notFound("Listing not found"));

        // =====================================================
        // 2. TYPE VALIDATION
        // =====================================================
        if (listing.getType() != Listing.Type.RENT) {
            throw ApiException.badRequest(
                    "Availability checking is only for rental listings"
            );
        }

        // =====================================================
        // 3. STATUS VALIDATION
        // =====================================================
        if (listing.getStatus() == Listing.Status.ARCHIVED) {
            return false;
        }

        if (listing.getStatus() == Listing.Status.SOLD) {
            return false;
        }

        // =====================================================
        // 4. REQUIRED DATES
        // =====================================================
        if (startDate == null || endDate == null ||
                startDate.isBlank() || endDate.isBlank()) {

            throw ApiException.badRequest(
                    "Start date and end date are required"
            );
        }

        LocalDate start;
        LocalDate end;

        try {
            start = LocalDate.parse(startDate);
            end = LocalDate.parse(endDate);
        } catch (Exception e) {
            throw ApiException.badRequest(
                    "Invalid date format. Use yyyy-MM-dd"
            );
        }

        // =====================================================
        // 5. DATE VALIDATION
        // =====================================================
        if (start.isAfter(end)) {
            throw ApiException.badRequest(
                    "Start date cannot be after end date"
            );
        }

        if (start.isBefore(LocalDate.now())) {
            throw ApiException.badRequest(
                    "Start date cannot be in the past"
            );
        }

        // =====================================================
        // 6. ACTIVE RENTED CHECK
        // =====================================================
        if (listing.getStatus() == Listing.Status.RENTED) {

            boolean activeRental =
                    rentalRepo.existsActiveRentals(
                            listing.getId(),
                            LocalDate.now()
                    );

            if (activeRental) {
                return false;
            }
        }

        // =====================================================
        // 7. DATE OVERLAP CHECK
        // =====================================================
        boolean hasOverlap =
                rentalRepo.existsOverlap(
                        listing.getId(),
                        start,
                        end
                );

        return !hasOverlap;
    }
}
