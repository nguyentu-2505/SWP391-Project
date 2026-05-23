package com.example.swp.exception;

import com.example.swp.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

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
    @ExceptionHandler({IllegalStateException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiResponse<Void>> handleIllegalStateAndArgument(RuntimeException ex) {
        return new ResponseEntity<>(
                ApiResponse.error("BAD_REQUEST", ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGlobalException(Exception ex, WebRequest request) {
        // In a real app, you would log the exception ex
        return new ResponseEntity<>(
                ApiResponse.error("INTERNAL_SERVER_ERROR", "An unexpected error occurred. " + ex.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    private static class ValidationError {
        private final String field;
        private final String message;

        ValidationError(String field, String message) {
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
