package com.shiro.cosnima.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "rentals")
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @ManyToOne
    @JoinColumn(name = "renter_id", nullable = false)
    private User renter;

    private LocalDate startDate;
    private LocalDate endDate;

    private BigDecimal totalPrice;
    private BigDecimal deposit;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    public enum Status {
        PENDING, APPROVED, REJECTED, ACTIVE, COMPLETED, CANCELLED
    }
}
