package com.mamregbkp.repository;

import com.mamregbkp.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM AppUser u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<AppUser> findByUsernameOrEmail(String usernameOrEmail);
}
