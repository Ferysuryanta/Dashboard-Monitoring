package com.mamregbkp.repository;

import com.mamregbkp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    long countByAttendDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT COUNT(DISTINCT a.member.id) FROM Attendance a WHERE a.attendDate BETWEEN :start AND :end")
    long countDistinctMemberByAttendDateBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
