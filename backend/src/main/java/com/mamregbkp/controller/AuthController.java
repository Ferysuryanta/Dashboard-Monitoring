package com.mamregbkp.controller;

import com.mamregbkp.dto.*;
import com.mamregbkp.model.AppUser;
import com.mamregbkp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication & User Management APIs")
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticate user and get JWT token")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request, authenticationManager);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register", description = "Register new user account")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User", description = "Get current authenticated user info")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LoginResponse.UserDto> getCurrentUser(@AuthenticationPrincipal AppUser user) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.getCurrentUser(user.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Profile", description = "Update current user profile")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<LoginResponse.UserDto> updateProfile(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(authService.updateProfile(user.getId(), request));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change Password", description = "Change current user password")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal AppUser user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        authService.changePassword(user.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Password berhasil diubah"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Logout current user (client should discard token)")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless, so logout is handled on client side
        // Optionally, we could blacklist the token here
        return ResponseEntity.ok(Map.of("message", "Logout berhasil"));
    }
}
