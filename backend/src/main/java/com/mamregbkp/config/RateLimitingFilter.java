package com.mamregbkp.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mamregbkp.exception.ErrorResponse;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Rate Limiting Filter to prevent brute force attacks.
 * Limits requests per IP address within a time window.
 */
@Component
@RequiredArgsConstructor
public class RateLimitingFilter implements Filter {

    // Configuration: max 100 requests per minute for general endpoints
    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    // Configuration: max 10 login attempts per minute
    private static final int MAX_LOGIN_ATTEMPTS_PER_MINUTE = 10;
    private static final long WINDOW_SIZE_MS = TimeUnit.MINUTES.toMillis(1);

    // Store request counts per IP
    private final Map<String, RequestCounter> requestCounts = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> loginAttempts = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String clientIP = getClientIP(request);
        String path = request.getRequestURI();

        // Check if this is a login endpoint (more strict rate limiting)
        if (path.contains("/api/auth/login") || path.contains("/api/auth/register")) {
            if (isAllowed(clientIP, loginAttempts, MAX_LOGIN_ATTEMPTS_PER_MINUTE)) {
                writeRateLimitResponse(response, request, "TERLALU_BANYAK_LOGIN", "Terlalu banyak percobaan login. Silakan coba lagi dalam 60 detik.");
                return;
            }
        }

        // General rate limiting
        if (isAllowed(clientIP, requestCounts, MAX_REQUESTS_PER_MINUTE)) {
            writeRateLimitResponse(response, request, "RATE_LIMIT_EXCEEDED", "Terlalu banyak permintaan. Mohon perlambat request Anda.");
            return;
        }

        // Add rate limit headers
        response.setHeader("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS_PER_MINUTE));
        RequestCounter counter = requestCounts.get(clientIP);
        if (counter != null) {
            response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, MAX_REQUESTS_PER_MINUTE - counter.count)));
        }

        chain.doFilter(req, res);
    }

    private boolean isAllowed(String clientIP, Map<String, RequestCounter> counters, int maxRequests) {
        long currentTime = System.currentTimeMillis();

        counters.compute(clientIP, (ip, counter) -> {
            if (counter == null || currentTime - counter.windowStart > WINDOW_SIZE_MS) {
                // New window
                return new RequestCounter(currentTime, 1);
            } else {
                // Increment existing counter
                counter.count++;
                return counter;
            }
        });

        RequestCounter counter = counters.get(clientIP);
        return counter.count > maxRequests;
    }

    private String getClientIP(HttpServletRequest request) {
        // Check for proxy headers
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP (original client)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }

        return request.getRemoteAddr();
    }

    private void writeRateLimitResponse(HttpServletResponse response, HttpServletRequest request, String code, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", "60");
        objectMapper.writeValue(response.getWriter(), ErrorResponse.of(
                HttpStatus.TOO_MANY_REQUESTS,
                code,
                message,
                request.getRequestURI()
        ));
    }

    /**
     * Cleanup old entries periodically (called every hour by scheduled task)
     */
    public void cleanup() {
        long currentTime = System.currentTimeMillis();
        requestCounts.entrySet().removeIf(entry ->
            currentTime - entry.getValue().windowStart > WINDOW_SIZE_MS * 5);
        loginAttempts.entrySet().removeIf(entry ->
            currentTime - entry.getValue().windowStart > WINDOW_SIZE_MS * 5);
    }

    private static class RequestCounter {
        long windowStart;
        int count;

        RequestCounter(long windowStart, int count) {
            this.windowStart = windowStart;
            this.count = count;
        }
    }
}
