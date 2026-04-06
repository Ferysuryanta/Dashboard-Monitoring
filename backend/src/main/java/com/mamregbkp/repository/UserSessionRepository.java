package com.mamregbkp.repository;

import com.mamregbkp.model.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {
    Optional<UserSession> findByIdAndIsActiveTrue(UUID id);
    List<UserSession> findByUserIdAndIsActiveTrue(UUID userId);
    long deleteByExpiresAtBefore(OffsetDateTime cutoff);
}

