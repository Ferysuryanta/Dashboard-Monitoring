package com.mamregbkp.service;

import com.mamregbkp.dto.*;
import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.exception.ResourceNotFoundException;
import com.mamregbkp.model.AppUser;
import com.mamregbkp.model.UserRole;
import com.mamregbkp.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final AppUserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan: " + username));
    }

    /**
     * Register new user
     */
    @Transactional
    public LoginResponse register(RegisterRequest request) {
        // Validate password confirmation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Konfirmasi password tidak cocok");
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username sudah digunakan");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email sudah digunakan");
        }

        // Create new user
        AppUser newUser = AppUser.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(UserRole.USER) // Default role for new registration
                .isActive(true)
                .isEmailVerified(false)
                .failedLoginAttempts(0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();

        newUser = userRepository.save(newUser);

        // Generate tokens
        String token = jwtService.generateToken(newUser);
        String refreshToken = jwtService.generateRefreshToken(newUser);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000)
                .user(mapToUserDto(newUser))
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request, AuthenticationManager authManager) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            // Increment failed login attempts
            userRepository.findByUsernameOrEmail(request.getUsername())
                    .ifPresent(user -> {
                        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
                        if (user.getFailedLoginAttempts() >= 5) {
                            user.setLockedUntil(OffsetDateTime.now().plusMinutes(30));
                        }
                        userRepository.save(user);
                    });
            throw new BadRequestException("Username atau password salah");
        }

        AppUser user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        // Check if account is locked
        if (user.getLockedUntil() != null && OffsetDateTime.now().isBefore(user.getLockedUntil())) {
            throw new BadRequestException("Akun terkunci. Silakan coba lagi dalam 30 menit.");
        }

        // Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(OffsetDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000) // in seconds
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password lama tidak sesuai");
        }

        // Validate new password
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Konfirmasi password tidak cocok");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("Password minimal 6 karakter");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(OffsetDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public LoginResponse.UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            // Check if email is already used by another user
            userRepository.findByEmail(request.getEmail())
                    .filter(existing -> !existing.getId().equals(userId))
                    .ifPresent(existing -> {
                        throw new BadRequestException("Email sudah digunakan");
                    });
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        return mapToUserDto(user);
    }

    public LoginResponse.UserDto getCurrentUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        return mapToUserDto(user);
    }

    private LoginResponse.UserDto mapToUserDto(AppUser user) {
        return LoginResponse.UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .memberId(user.getMember() != null ? user.getMember().getId() : null)
                .build();
    }
}
