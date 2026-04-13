package com.shiro.cosnima.utility;

import com.shiro.cosnima.dto.response.RentalResponse;
import com.shiro.cosnima.model.Rental;

import java.util.UUID;

public class RentalMapper {

    public static RentalResponse toDto(Rental rental) {
        if (rental == null) return null;

        RentalResponse dto = new RentalResponse();

        dto.setId(rental.getId());

        if (rental.getListing() != null) {
            dto.setListingId(rental.getListing().getId());
            dto.setListingTitle(rental.getListing().getTitle());
        }

        if (rental.getRenter() != null) {
            // IMPORTANT: ensure renter.getId() is UUID
            dto.setRenterId((UUID) rental.getRenter().getId());
            dto.setRenterUsername(rental.getRenter().getUsername());
        }

        dto.setStartDate(rental.getStartDate());
        dto.setEndDate(rental.getEndDate());

        dto.setTotalPrice(rental.getTotalPrice());
        dto.setDeposit(rental.getDeposit());

        if (rental.getStatus() != null) {
            dto.setStatus(rental.getStatus().name());
        }

        return dto;
    }
}
