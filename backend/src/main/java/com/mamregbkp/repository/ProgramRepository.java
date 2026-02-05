package com.mamregbkp.repository;

import com.mamregbkp.model.Program;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long>, JpaSpecificationExecutor<Program> {
    Page<Program> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("select distinct p.category from Program p where p.category is not null")
    List<String> findDistinctCategories();
}
