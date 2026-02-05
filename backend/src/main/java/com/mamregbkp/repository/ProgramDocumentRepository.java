package com.mamregbkp.repository;

import com.mamregbkp.model.ProgramDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramDocumentRepository extends JpaRepository<ProgramDocument, Long> {
    List<ProgramDocument> findByProgramId(Long programId);
}
