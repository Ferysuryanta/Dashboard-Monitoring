package com.mamregbkp.repository;

import com.mamregbkp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    long countByAttendDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT COUNT(DISTINCT a.member.id) FROM Attendance a WHERE a.attendDate BETWEEN :start AND :end")
    long countDistinctMemberByAttendDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Count attendance by sector and date range (for weekly report)
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.member.sector.id = :sectorId AND a.attendDate BETWEEN :start AND :end AND a.present = true")
    long countBySectorAndDateRange(@Param("sectorId") Long sectorId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // Count distinct members who attended by sector and date range
    @Query("SELECT COUNT(DISTINCT a.member.id) FROM Attendance a WHERE a.member.sector.id = :sectorId AND a.attendDate BETWEEN :start AND :end AND a.present = true")
    long countDistinctMembersBySectorAndDateRange(@Param("sectorId") Long sectorId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // Sum kolpi amount by sector and date range
    @Query("SELECT COALESCE(SUM(a.kolpiAmount), 0) FROM Attendance a WHERE a.member.sector.id = :sectorId AND a.attendDate BETWEEN :start AND :end AND a.present = true")
    BigDecimal sumKolpiBySectorAndDateRange(@Param("sectorId") Long sectorId, @Param("start") LocalDate start, @Param("end") LocalDate end);

    // Find all attendances by sector and date range
    List<Attendance> findByMemberSectorIdAndAttendDateBetweenAndPresentTrue(Long sectorId, LocalDate start, LocalDate end);

    // Get all member IDs who attended in date range
    @Query("SELECT DISTINCT a.member.id FROM Attendance a WHERE a.attendDate BETWEEN :start AND :end AND a.present = true")
    List<UUID> findDistinctMemberIdsByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
