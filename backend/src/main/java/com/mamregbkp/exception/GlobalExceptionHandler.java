package com.mamregbkp.exception;

import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @Value("${app.security.enabled:true}")
    private boolean securityEnabled;

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, WebRequest req) {
        return buildResponse(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", ex.getMessage(), req);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, WebRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), req);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest req) {
        return buildResponse(HttpStatus.BAD_REQUEST, "ILLEGAL_ARGUMENT", ex.getMessage(), req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, WebRequest req) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());
        String message = String.join(", ", details);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", message, extractPath(req), details));
    }

    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleAuthException(Exception ex, WebRequest req) {
        // Log the actual error for debugging but don't expose details
        log.warn("Authentication failed: {}", ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", "Username atau password salah", req);
    }

    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedException(LockedException ex, WebRequest req) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "ACCOUNT_LOCKED", "Akun terkunci. Silakan coba lagi dalam 30 menit.", req);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException ex, WebRequest req) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Token autentikasi tidak valid atau sudah kedaluwarsa", req);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, WebRequest req) {
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

        return buildResponse(HttpStatus.CONFLICT, "DATA_INTEGRITY_VIOLATION", message, req);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(ResponseStatusException ex, WebRequest req) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return buildResponse(status, status.name(), message, req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest req) {
        // Always log the full error for debugging
        log.error("Unhandled exception occurred", ex);

        // In production mode, don't expose internal error details
        if (securityEnabled) {
            return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Terjadi kesalahan pada server. Silakan coba lagi nanti.", req);
        } else {
            // In dev mode, show more details
            return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Internal server error: " + ex.getMessage(), req);
        }
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String code, String message, WebRequest req) {
        return ResponseEntity.status(status).body(ErrorResponse.of(status, code, message, extractPath(req)));
    }

    private String extractPath(WebRequest req) {
        String description = req.getDescription(false);
        return description.startsWith("uri=") ? description.substring(4) : description;
    }
}
