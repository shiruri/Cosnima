package com.shiro.cosnima.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateOfferRequest {

    @NotNull(message = "Offered price is required")
    @DecimalMin(value = "0.01", message = "Offered price must be greater than 0")
    private BigDecimal offeredPrice;

    private String message;

    // getters & setters

    public BigDecimal getOfferedPrice() {
        return offeredPrice;
    }

    public void setOfferedPrice(BigDecimal offeredPrice) {
        this.offeredPrice = offeredPrice;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
