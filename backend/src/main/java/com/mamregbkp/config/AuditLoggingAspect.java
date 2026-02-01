package com.mamregbkp.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Audit Logging Aspect for tracking sensitive operations.
 * Logs authentication events, data modifications, and security-related actions.
 */
@Aspect
@Component
public class AuditLoggingAspect {

    private static final Logger auditLog = LoggerFactory.getLogger("AUDIT");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Pointcut for authentication-related methods
     */
    @Pointcut("execution(* com.mamregbkp.service.AuthService.login(..))")
    public void loginOperation() {}

    @Pointcut("execution(* com.mamregbkp.service.AuthService.register(..))")
    public void registerOperation() {}

    @Pointcut("execution(* com.mamregbkp.service.AuthService.changePassword(..))")
    public void changePasswordOperation() {}

    /**
     * Pointcut for data modification operations
     */
    @Pointcut("execution(* com.mamregbkp.service.*Service.create(..))")
    public void createOperation() {}

    @Pointcut("execution(* com.mamregbkp.service.*Service.update(..))")
    public void updateOperation() {}

    @Pointcut("execution(* com.mamregbkp.service.*Service.delete(..))")
    public void deleteOperation() {}

    /**
     * Log login attempts
     */
    @Around("loginOperation()")
    public Object logLoginAttempt(ProceedingJoinPoint joinPoint) throws Throwable {
        String username = extractUsername(joinPoint.getArgs());
        String clientIP = getClientIP();

        try {
            Object result = joinPoint.proceed();
            logAudit("LOGIN_SUCCESS", username, clientIP, "User logged in successfully");
            return result;
        } catch (Exception e) {
            logAudit("LOGIN_FAILED", username, clientIP, "Login failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Log registration attempts
     */
    @Around("registerOperation()")
    public Object logRegistration(ProceedingJoinPoint joinPoint) throws Throwable {
        String clientIP = getClientIP();

        try {
            Object result = joinPoint.proceed();
            logAudit("REGISTRATION_SUCCESS", "new_user", clientIP, "New user registered");
            return result;
        } catch (Exception e) {
            logAudit("REGISTRATION_FAILED", "unknown", clientIP, "Registration failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Log password change attempts
     */
    @Around("changePasswordOperation()")
    public Object logPasswordChange(ProceedingJoinPoint joinPoint) throws Throwable {
        String username = getCurrentUsername();
        String clientIP = getClientIP();

        try {
            Object result = joinPoint.proceed();
            logAudit("PASSWORD_CHANGED", username, clientIP, "Password changed successfully");
            return result;
        } catch (Exception e) {
            logAudit("PASSWORD_CHANGE_FAILED", username, clientIP, "Password change failed: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Log data creation
     */
    @Around("createOperation()")
    public Object logCreate(ProceedingJoinPoint joinPoint) throws Throwable {
        String username = getCurrentUsername();
        String serviceName = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String clientIP = getClientIP();

        try {
            Object result = joinPoint.proceed();
            logAudit("DATA_CREATED", username, clientIP,
                String.format("Created new record in %s", serviceName));
            return result;
        } catch (Exception e) {
            logAudit("DATA_CREATE_FAILED", username, clientIP,
                String.format("Failed to create record in %s: %s", serviceName, e.getMessage()));
            throw e;
        }
    }

    /**
     * Log data updates
     */
    @Around("updateOperation()")
    public Object logUpdate(ProceedingJoinPoint joinPoint) throws Throwable {
        String username = getCurrentUsername();
        String serviceName = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String clientIP = getClientIP();
        Object[] args = joinPoint.getArgs();
        String entityId = args.length > 0 ? String.valueOf(args[0]) : "unknown";

        try {
            Object result = joinPoint.proceed();
            logAudit("DATA_UPDATED", username, clientIP,
                String.format("Updated record [%s] in %s", entityId, serviceName));
            return result;
        } catch (Exception e) {
            logAudit("DATA_UPDATE_FAILED", username, clientIP,
                String.format("Failed to update record [%s] in %s: %s", entityId, serviceName, e.getMessage()));
            throw e;
        }
    }

    /**
     * Log data deletions
     */
    @Around("deleteOperation()")
    public Object logDelete(ProceedingJoinPoint joinPoint) throws Throwable {
        String username = getCurrentUsername();
        String serviceName = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String clientIP = getClientIP();
        Object[] args = joinPoint.getArgs();
        String entityId = args.length > 0 ? String.valueOf(args[0]) : "unknown";

        try {
            Object result = joinPoint.proceed();
            logAudit("DATA_DELETED", username, clientIP,
                String.format("Deleted record [%s] from %s", entityId, serviceName));
            return result;
        } catch (Exception e) {
            logAudit("DATA_DELETE_FAILED", username, clientIP,
                String.format("Failed to delete record [%s] from %s: %s", entityId, serviceName, e.getMessage()));
            throw e;
        }
    }

    private void logAudit(String action, String username, String clientIP, String message) {
        String timestamp = LocalDateTime.now().format(formatter);
        auditLog.info("[{}] ACTION={} USER={} IP={} MSG={}",
            timestamp, action, username, clientIP, message);
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "anonymous";
    }

    private String extractUsername(Object[] args) {
        if (args.length > 0 && args[0] != null) {
            try {
                // Try to get username from LoginRequest
                Object loginRequest = args[0];
                var method = loginRequest.getClass().getMethod("getUsername");
                return String.valueOf(method.invoke(loginRequest));
            } catch (Exception e) {
                return "unknown";
            }
        }
        return "unknown";
    }

    private String getClientIP() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                String xForwardedFor = request.getHeader("X-Forwarded-For");
                if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                    return xForwardedFor.split(",")[0].trim();
                }
                return request.getRemoteAddr();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "unknown";
    }
}
