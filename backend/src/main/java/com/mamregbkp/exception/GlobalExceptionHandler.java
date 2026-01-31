package com.mamregbkp.exception;

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
        ErrorResponse e = new ErrorResponse();
        e.setMessage("Username atau password salah");
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, WebRequest req) {
        ErrorResponse e = new ErrorResponse();
        e.setMessage("Internal server error: " + ex.getMessage());
        e.setPath(req.getDescription(false));
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e);
    }
}
