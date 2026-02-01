package com.mamregbkp.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest req) {
        ErrorResponse e = new ErrorResponse();
        e.setMessage(ex.getMessage());
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, WebRequest req) {
        ErrorResponse e = new ErrorResponse();
        e.setMessage(ex.getMessage());
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest req) {
        ErrorResponse e = new ErrorResponse();
        e.setMessage(ex.getMessage());
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest req) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        ErrorResponse e = new ErrorResponse();
        e.setMessage(message);
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e);
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleAuthException(Exception ex, WebRequest req) {
        // Log the actual error for debugging but don't expose details
        log.warn("Authentication failed: {}", ex.getMessage());

        ErrorResponse e = new ErrorResponse();
        e.setMessage("Username atau password salah");
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest req) {
        ErrorResponse e = new ErrorResponse();
        String message = "Operasi tidak dapat dilakukan karena data masih terhubung dengan data lain";

        // Check for specific constraint violations
        String exMessage = ex.getMostSpecificCause().getMessage();
        if (exMessage != null) {
            if (exMessage.contains("foreign key") || exMessage.contains("fk_")) {
                message = "Tidak dapat menghapus data karena masih digunakan oleh data lain";
            } else if (exMessage.contains("unique") || exMessage.contains("duplicate")) {
                message = "Data dengan nilai tersebut sudah ada";
            }
        }

        e.setMessage(message);
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.CONFLICT).body(e);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest req) {
        // Always log the full error for debugging
        log.error("Unhandled exception occurred", ex);

        ErrorResponse e = new ErrorResponse();

        // In production mode, don't expose internal error details
        if (securityEnabled) {
            e.setMessage("Terjadi kesalahan pada server. Silakan coba lagi nanti.");
        } else {
            // In dev mode, show more details
            e.setMessage("Internal server error: " + ex.getMessage());
        }

        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
    }
}
