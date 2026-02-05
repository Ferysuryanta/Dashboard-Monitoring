package com.mamregbkp.repository;

import com.mamregbkp.model.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {
    Page<Program> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
