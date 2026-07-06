package com.example.swp.exception;

import com.example.swp.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        return new ResponseEntity<>(
                ApiResponse.error("RESOURCE_NOT_FOUND", ex.getMessage()),
                HttpStatus.NOT_FOUND
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Object details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ValidationError(error.getField(), error.getDefaultMessage()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(
                ApiResponse.error("VALIDATION_ERROR", "Invalid input", details),
                HttpStatus.BAD_REQUEST
        );
    }
    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class, BadRequestException.class})
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateAndArgument(RuntimeException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("BAD_REQUEST", ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        String msg = "Database integrity constraint violation.";
        String specificMsg = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();
        if (specificMsg != null) {
            String lower = specificMsg.toLowerCase();
            if (lower.contains("uq__user") || lower.contains("username") || lower.contains("email") || lower.contains("_user")) {
                msg = "Username or email already exists.";
            } else if (lower.contains("track") || lower.contains("uq_track") || lower.contains("uq__track")) {
                msg = "Track name already exists in this hackathon.";
            } else if (lower.contains("round") || lower.contains("uq_round") || lower.contains("uq__round")) {
                msg = "Round name already exists in this hackathon.";
            } else if (lower.contains("prize") || lower.contains("uq_prize") || lower.contains("uq__prize")) {
                msg = "Prize name or rank already exists.";
            } else if (lower.contains("foreign key") || lower.contains("reference") || lower.contains("violation of foreign key")) {
                msg = "Cannot delete or update this record because it is referenced by other data.";
            } else {
                msg = "Database violation: " + specificMsg;
            }
        }
        return new ResponseEntity<>(
                ApiResponse.error("BAD_REQUEST", msg),
                HttpStatus.BAD_REQUEST
        );
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(AuthenticationException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("UNAUTHORIZED", "Authentication failed."),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("FORBIDDEN", "You do not have permission to access this resource."),
                HttpStatus.FORBIDDEN
        );
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("METHOD_NOT_ALLOWED", ex.getMessage()),
                HttpStatus.METHOD_NOT_ALLOWED
        );
    }

    @ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Void>> handleOptimisticLockingFailure(org.springframework.orm.ObjectOptimisticLockingFailureException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("CONFLICT", "This request was already modified by another user. Please refresh and try again."),
                HttpStatus.CONFLICT
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex, WebRequest request) {
        return new ResponseEntity<>(
                ApiResponse.error("INTERNAL_SERVER_ERROR", ex.toString() + " | " + ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    public static class ValidationError {
        private final String field;
        private final String message;

        public ValidationError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public String getMessage() {
            return message;
        }
    }
}
