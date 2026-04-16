package com.shiro.cosnima.model;

public class ApiException extends RuntimeException {
    private final int status;

    public ApiException(String message, int status) {
        super(message);
        this.status = status;
    }

    public ApiException(String message) {
        super(message);
        this.status = 400;
    }

    public int getStatus() {
        return status;
    }

    public static ApiException notFound(String message) {
        return new ApiException(message, 404);
    }

    public static ApiException conflict(String message) {
        return new ApiException(message, 409);
    }

    public static ApiException forbidden(String message) {
        return new ApiException(message, 403);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(message, 400);
    }
}
