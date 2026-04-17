package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.request.RentalRequest;
import com.shiro.cosnima.dto.response.RentalResponse;
import com.shiro.cosnima.model.ApiException;
import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.Rental;
import com.shiro.cosnima.model.RentalStatus;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.ListingRepository;
import com.shiro.cosnima.repository.RentalRepository;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.utility.RentalMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class RentalService {

    private final RentalRepository rentalRepo;
    private final ListingRepository listingRepo;
    private final UserRepository userRepo;

    @Autowired
    public RentalService(RentalRepository rentalRepo, ListingRepository listingRepo, UserRepository userRepo) {
        this.rentalRepo = rentalRepo;
        this.listingRepo = listingRepo;
        this.userRepo = userRepo;
    }

    // ─────────────────────────────
    // RENTER SIDE
    // ─────────────────────────────

    // GET /api/rentals/mine
    public List<RentalResponse> getMyRentals(UUID userId) {
        return rentalRepo.findByRenterId(userId).stream()
                .map(RentalMapper::toDto)
                .toList();
    }

    public List<RentalResponse> getMyRentalsByStatus(UUID userId, RentalStatus status) {
        return rentalRepo.findByRenterIdAndStatus(userId, status).stream()
                .map(RentalMapper::toDto)
                .toList();
    }


    // ─────────────────────────────
    // SELLER SIDE
    // ─────────────────────────────

    // GET /api/rentals/my-listings
    public List<RentalResponse> getRequestsOnMyListings(UUID userId) {
        return rentalRepo.findRequestsBySellerId(userId).stream()
                .map(RentalMapper::toDto)
                .toList();
    }

    public List<RentalResponse> getRequestsOnMyListingsByStatus(UUID userId, RentalStatus status) {
        return rentalRepo.findByListingSellerIdAndStatus(userId, status).stream()
                .map(RentalMapper::toDto)
                .toList();
    }
    public RentalResponse requestRent(UUID userId, RentalRequest rentRequest) {

        // 1. Get listing safely
        Listing listing = listingRepo.findById(rentRequest.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        if (listing.getStatus() == Listing.Status.ARCHIVED) {
            throw ApiException.badRequest("This listing is no longer available");
        }

        // 2. Get user safely
        User renter = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(rentalRepo.findByRenterIdAndListingId(userId,rentRequest.getListingId()) != null) {
            throw ApiException.conflict("You have already requested on this item");

        }
        // 3. Validate dates
        if (rentRequest.getStartDate().isAfter(rentRequest.getEndDate())) {
            throw ApiException.badRequest("Start date cannot be after end date");
        }

        if (rentRequest.getStartDate().isBefore(LocalDate.now())) {
            throw ApiException.badRequest("Start date cannot be in the past");
        }


        // 5. Create rental
        Rental rent = new Rental();
        rent.setListing(listing);
        rent.setRenter(renter);
        rent.setDeposit(rentRequest.getDeposit());
        rent.setStartDate(rentRequest.getStartDate());
        rent.setEndDate(rentRequest.getEndDate());
        rent.setStatus(RentalStatus.PENDING);

        // 6. calculate total price
        long days = java.time.temporal.ChronoUnit.DAYS.between(
                rentRequest.getStartDate(),
                rentRequest.getEndDate()
        );

        rent.setTotalPrice(rentRequest.getTotalPrice()
        );

        // 7. Save + return DTO
        return RentalMapper.toDto(rentalRepo.save(rent));
    }


    public RentalResponse approveRental(long rentalId, UUID userId) {

        Rental rent = rentalRepo.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        // ownership check (better way)
        if (!rent.getListing().getSeller().getId().equals(userId)) {
            throw ApiException.forbidden("Not allowed");
        }

        // status check
        if (rent.getStatus() != RentalStatus.PENDING) {
            throw ApiException.badRequest("Only pending rentals can be approved");
        }

        List<Rental> conflicts = rentalRepo.findConflictingRentals(
                rent.getListing().getId(),
                rent.getStartDate(),
                rent.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw ApiException.conflict("Listing is already booked for this date range");
        }

        //update listing status
        Listing listing = rent.getListing();

// approve rental
        rent.setStatus(RentalStatus.APPROVED);

// CHECK IF RENTAL IS ACTIVE TODAY
        LocalDate today = LocalDate.now();

        boolean isActiveNow =
                !today.isBefore(rent.getStartDate()) &&
                        !today.isAfter(rent.getEndDate());

// ONLY mark RENTED if currently active
        if (isActiveNow) {
            listing.setStatus(Listing.Status.RENTED);
        } else {
            listing.setStatus(Listing.Status.AVAILABLE);
        }

        listingRepo.save(listing);


        return RentalMapper.toDto(rentalRepo.save(rent));
    }


    public RentalResponse rejectRental(long rentalId,UUID userId) {
        Rental rent = rentalRepo.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        if (!rent.getListing().getSeller().getId().equals(userRepo.findById(userId).get().getId())) {
            throw ApiException.forbidden("Not allowed");
        }
        if (rent.getStatus() != RentalStatus.PENDING) {
            throw ApiException.badRequest("Only pending rentals can be approved");
        }
        rent.setStatus(RentalStatus.REJECTED);
        return RentalMapper.toDto(rentalRepo.save(rent));
    }

    public RentalResponse completeRental(long rentalId,UUID userId) {
        Rental rent = rentalRepo.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        if (!rent.getListing().getSeller().getId().equals(userRepo.findById(userId).get().getId())) {
            throw ApiException.forbidden("Not allowed");
        }
        if (rent.getStatus() != RentalStatus.COMPLETED) {
            throw ApiException.badRequest("Rental Already Completed");
        }
        rent.setStatus(RentalStatus.COMPLETED);
        return RentalMapper.toDto(rentalRepo.save(rent));
    }

    public RentalResponse cancelRental(long rentalId,UUID userId) {
        Rental rent = rentalRepo.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        if (!rent.getListing().getSeller().getId().equals(userRepo.findById(userId).get().getId())) {
            throw ApiException.forbidden("Not allowed");
        }
        if (rent.getStatus() != RentalStatus.PENDING) {
            throw ApiException.badRequest("Only pending rentals can be approved");
        }
        rent.setStatus(RentalStatus.CANCELLED);
        return RentalMapper.toDto(rentalRepo.save(rent));
    }
    public Boolean checkAvailability(String listingId, RentalRequest request) {
        Listing listing = listingRepo.findById(listingId).orElseThrow();

        Rental rent = rentalRepo.findByListingId(listingId);

        if (rent == null) return true; // no existing rental = available

        LocalDate existingStart = rent.getStartDate();
        LocalDate existingEnd   = rent.getEndDate();

        LocalDate requestStart  = request.getStartDate();
        LocalDate requestEnd    = request.getEndDate();

        boolean isOverlapping =
                !requestStart.isAfter(existingEnd) &&
                        !requestEnd.isBefore(existingStart);

        return !isOverlapping; // available if NOT overlapping
    }



}
