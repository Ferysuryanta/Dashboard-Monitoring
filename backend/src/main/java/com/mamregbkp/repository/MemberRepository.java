package com.mamregbkp.repository;

import com.mamregbkp.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MemberRepository extends JpaRepository<Member, UUID>, JpaSpecificationExecutor<Member> {
    Page<Member> findByStatus(String status, Pageable pageable);
    Page<Member> findBySectorId(Long sectorId, Pageable pageable);
    long countBySectorId(Long sectorId);
    Page<Member> findByStatusIgnoreCase(String status, Pageable pageable);

    Optional<Member> findByEmailIgnoreCase(String email);
    List<Member> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(String firstName, String lastName);
    List<Member> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    List<Member> findByFirstNameContainingIgnoreCase(String q);
    List<Member> findByLastNameContainingIgnoreCase(String q);

    long countByStatus(String status);
    List<Member> findByJoinedDateAfter(LocalDate date);
}
