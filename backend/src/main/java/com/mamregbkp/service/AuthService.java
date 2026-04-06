package com.mamregbkp.service;

import com.mamregbkp.dto.*;
import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.exception.ResourceNotFoundException;
import com.mamregbkp.model.AppUser;
import com.mamregbkp.model.UserSession;
import com.mamregbkp.model.UserRole;
import com.mamregbkp.repository.AppUserRepository;
import com.mamregbkp.repository.UserSessionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final AppUserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final UserSessionRepository userSessionRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User tidak ditemukan: " + username));
    }

    /**
     * Register new user
     */
    @Transactional
    public LoginResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
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
        AuthTokens tokens = createSessionTokens(newUser, httpRequest);

        return LoginResponse.builder()
                .token(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000)
                .user(mapToUserDto(newUser))
                .build();
    }

    @Transactional
    public LoginResponse login(LoginRequest request, AuthenticationManager authManager, HttpServletRequest httpRequest) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (LockedException e) {
            throw new BadRequestException("Akun terkunci. Silakan coba lagi dalam 30 menit.");
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

        AuthTokens tokens = createSessionTokens(user, httpRequest);

        return LoginResponse.builder()
                .token(tokens.accessToken())
                .refreshToken(tokens.refreshToken())
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000) // in seconds
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request, HttpServletRequest httpRequest) {
        String refreshToken = request.getRefreshToken().trim();
        if (!jwtService.isRefreshToken(refreshToken)) {
            throw new BadRequestException("Refresh token tidak valid");
        }

        String username = jwtService.extractUsername(refreshToken);
        UUID sessionId = jwtService.extractSessionId(refreshToken);
        if (sessionId == null) {
            throw new BadRequestException("Refresh token tidak memiliki sesi yang valid");
        }

        AppUser user = userRepository.findByUsernameOrEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new BadRequestException("Refresh token sudah tidak berlaku");
        }

        UserSession session = userSessionRepository.findByIdAndIsActiveTrue(sessionId)
                .orElseThrow(() -> new BadRequestException("Sesi login sudah tidak aktif"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Sesi login tidak sesuai dengan user");
        }

        String refreshTokenHash = hashToken(refreshToken);
        if (!refreshTokenHash.equals(session.getTokenHash())) {
            session.setIsActive(false);
            userSessionRepository.save(session);
            throw new BadRequestException("Refresh token tidak cocok dengan sesi aktif");
        }

        session.setExpiresAt(OffsetDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpirationTime())));
        session.setLastAccessedAt(OffsetDateTime.now());
        session.setIpAddress(extractClientIp(httpRequest));
        session.setUserAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null);

        String accessToken = jwtService.generateAccessToken(user, session.getId());
        String rotatedRefreshToken = jwtService.generateRefreshToken(user, session.getId());
        session.setTokenHash(hashToken(rotatedRefreshToken));
        userSessionRepository.save(session);

        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(rotatedRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getExpirationTime() / 1000)
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
        revokeAllActiveSessions(userId);
    }

    @Transactional
    public void logout(UUID userId, String authorizationHeader, LogoutRequest request) {
        UUID sessionId = extractSessionIdFromAuthHeader(authorizationHeader);
        if (request != null && request.getRefreshToken() != null && !request.getRefreshToken().isBlank()) {
            UUID refreshSessionId = jwtService.extractSessionId(request.getRefreshToken().trim());
            if (refreshSessionId != null) {
                sessionId = refreshSessionId;
            }
        }

        if (sessionId != null) {
            userSessionRepository.findByIdAndIsActiveTrue(sessionId)
                    .filter(session -> session.getUser().getId().equals(userId))
                    .ifPresent(session -> {
                        session.setIsActive(false);
                        session.setLastAccessedAt(OffsetDateTime.now());
                        userSessionRepository.save(session);
                    });
            return;
        }

        revokeAllActiveSessions(userId);
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

    private AuthTokens createSessionTokens(AppUser user, HttpServletRequest httpRequest) {
        UserSession session = UserSession.builder()
                .user(user)
                .isActive(true)
                .expiresAt(OffsetDateTime.now().plus(Duration.ofMillis(jwtService.getRefreshExpirationTime())))
                .deviceInfo(httpRequest != null ? httpRequest.getHeader("Sec-CH-UA-Platform") : null)
                .ipAddress(extractClientIp(httpRequest))
                .userAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null)
                .tokenHash(hashToken(UUID.randomUUID().toString()))
                .build();

        session = userSessionRepository.save(session);

        String accessToken = jwtService.generateAccessToken(user, session.getId());
        String refreshToken = jwtService.generateRefreshToken(user, session.getId());
        session.setTokenHash(hashToken(refreshToken));
        userSessionRepository.save(session);
        return new AuthTokens(accessToken, refreshToken);
    }

    private void revokeAllActiveSessions(UUID userId) {
        List<UserSession> sessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
        for (UserSession session : sessions) {
            session.setIsActive(false);
            session.setLastAccessedAt(OffsetDateTime.now());
        }
        userSessionRepository.saveAll(sessions);
    }

    private UUID extractSessionIdFromAuthHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        return jwtService.extractSessionId(authorizationHeader.substring(7));
    }

    private String extractClientIp(HttpServletRequest httpRequest) {
        if (httpRequest == null) {
            return null;
        }

        String xForwardedFor = httpRequest.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = httpRequest.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return httpRequest.getRemoteAddr();
    }

    private String hashToken(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("Algoritma hash SHA-256 tidak tersedia", ex);
        }
    }

    private record AuthTokens(String accessToken, String refreshToken) {
    }
}
