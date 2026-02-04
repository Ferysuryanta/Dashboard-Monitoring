package com.mamregbkp.service;

import com.mamregbkp.dto.AttendanceDto;
import org.springframework.data.domain.Page;

import java.time.LocalDate;

public interface AttendanceService {
    AttendanceDto create(AttendanceDto dto);
    AttendanceDto update(Long id, AttendanceDto dto);
    void delete(Long id);
    AttendanceDto getById(Long id);
    Page<AttendanceDto> list(int page, int size, String member, LocalDate from, LocalDate to, Long sectorId, String sectorName);
}
