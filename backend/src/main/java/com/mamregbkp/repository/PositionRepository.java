package com.mamregbkp.repository;

import com.mamregbkp.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PositionRepository extends JpaRepository<Position, Long> {

    Optional<Position> findByNameIgnoreCase(String name);
}
