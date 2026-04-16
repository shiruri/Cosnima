package com.shiro.cosnima.exception;

import com.shiro.cosnima.model.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApiException(ApiException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(Map.of("message", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        
        if (message == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "An error occurred"));
        }
        
        // Handle database duplicate errors - extract user-friendly message
        if (message.contains("Duplicate entry") || message.contains("unique constraint")) {
            if (message.contains("us@ExceptionHandler(Exception.class)\n" +
                    "public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {\n" +
                    "\n" +
                    "    // \uD83D\uDD25 PRINT FULL ERROR IN CONSOLE\n" +
                    "    ex.printStackTrace();\n" +
                    "\n" +
                    "    return ResponseEntity\n" +
                    "            .status(HttpStatus.INTERNAL_SERVER_ERROR)\n" +
                    "            .body(Map.of(\n" +
                    "                    \"message\", ex.getMessage() != null ? ex.getMessage() : \"Unexpected error\",\n" +
                    "                    \"errorType\", ex.getClass().getSimpleName()\n" +
                    "            ));\n" +
                    "}\nername")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Username is already taken. Please choose another."));
            }
            if (message.contains("email")) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email is already in use. Please use another email."));
            }
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This value is already in use. Please try another."));
        }
        
        if (message.contains("not found")) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", message));
        }
        
        if (message.contains("Not allowed") || 
                message.contains("No Permission") ||
                message.contains("Unauthorized") ||
                message.contains("You cannot") ||
                message.contains("not part of") ||
                message.contains("Invalid")) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", message));
        }
        
        if (message.contains("already")) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", message));
        }
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", message));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Access denied"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, String>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid parameter: " + ex.getName()));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {

        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "message", ex.getMessage() != null ? ex.getMessage() : "Unexpected error",
                        "errorType", ex.getClass().getSimpleName()
                ));
    }

}
