package com.mamregbkp.service;

import com.mamregbkp.model.AppUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_EMAIL = "email";
    private static final String CLAIM_FULL_NAME = "fullName";
    private static final String CLAIM_SESSION_ID = "sid";
    private static final String CLAIM_TOKEN_TYPE = "typ";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:3600000}") // 1 hour in milliseconds
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days in milliseconds
    private long refreshExpiration;

    @PostConstruct
    void validateConfiguration() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("JWT_SECRET wajib diisi");
        }

        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET harus base64 dan minimal 256-bit");
        }
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAccessToken(AppUser user, UUID sessionId) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put(CLAIM_ROLE, user.getRole().name());
        extraClaims.put(CLAIM_EMAIL, user.getEmail());
        extraClaims.put(CLAIM_FULL_NAME, user.getFullName());
        extraClaims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS);
        if (sessionId != null) {
            extraClaims.put(CLAIM_SESSION_ID, sessionId.toString());
        }
        return generateToken(extraClaims, user);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails, UUID sessionId) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH);
        if (sessionId != null) {
            extraClaims.put(CLAIM_SESSION_ID, sessionId.toString());
        }
        return buildToken(extraClaims, userDetails, refreshExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token) && isIssuedAfterPasswordChange(token, userDetails);
    }

    public UUID extractSessionId(String token) {
        String value = extractClaim(token, claims -> claims.get(CLAIM_SESSION_ID, String.class));
        if (value == null || value.isBlank()) {
            return null;
        }
        return UUID.fromString(value);
    }

    public boolean isRefreshToken(String token) {
        return TOKEN_TYPE_REFRESH.equalsIgnoreCase(extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class)));
    }

    public boolean isAccessToken(String token) {
        String tokenType = extractClaim(token, claims -> claims.get(CLAIM_TOKEN_TYPE, String.class));
        return tokenType == null || TOKEN_TYPE_ACCESS.equalsIgnoreCase(tokenType);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    public long getRefreshExpirationTime() {
        return refreshExpiration;
    }

    private boolean isIssuedAfterPasswordChange(String token, UserDetails userDetails) {
        if (!(userDetails instanceof AppUser appUser) || appUser.getPasswordChangedAt() == null) {
            return true;
        }

        Date issuedAt = extractClaim(token, Claims::getIssuedAt);
        if (issuedAt == null) {
            return false;
        }

        return !issuedAt.toInstant().isBefore(appUser.getPasswordChangedAt().toInstant());
    }
}
