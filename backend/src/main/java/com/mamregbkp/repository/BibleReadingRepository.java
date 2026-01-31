package com.mamregbkp.repository;

import com.mamregbkp.model.BibleReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BibleReadingRepository extends JpaRepository<BibleReading, Long> {

    // Count completed readings for a specific date
    long countByReadingDateAndCompletedTrue(LocalDate date);

    // Count completed readings between dates
    long countByReadingDateBetweenAndCompletedTrue(LocalDate start, LocalDate end);

    // Count distinct members who completed reading on a date
    @Query("SELECT COUNT(DISTINCT br.memberId) FROM BibleReading br WHERE br.readingDate = :date AND br.completed = true")
    long countDistinctMembersByReadingDate(@Param("date") LocalDate date);

    // Count distinct members who completed reading between dates
    @Query("SELECT COUNT(DISTINCT br.memberId) FROM BibleReading br WHERE br.readingDate BETWEEN :start AND :end AND br.completed = true")
    long countDistinctMembersByReadingDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Count total reading days in a month (distinct dates with at least one completed reading)
    @Query("SELECT COUNT(DISTINCT br.readingDate) FROM BibleReading br WHERE br.readingDate BETWEEN :start AND :end AND br.completed = true")
    long countDistinctReadingDaysBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Find all readings for a member
    List<BibleReading> findByMemberIdOrderByReadingDateDesc(UUID memberId);

    // Find readings for a member in date range
    List<BibleReading> findByMemberIdAndReadingDateBetween(UUID memberId, LocalDate start, LocalDate end);
}
