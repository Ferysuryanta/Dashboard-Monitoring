package com.mamregbkp.repository;

import com.mamregbkp.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    long countByAttendDateBetween(LocalDate start, LocalDate end);
    long countDistinctMemberByAttendDateBetween(LocalDate start, LocalDate end);
}
