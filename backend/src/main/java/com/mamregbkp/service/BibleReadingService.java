package com.mamregbkp.service;

import com.mamregbkp.dto.BibleReadingDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BibleReadingService {

    Page<BibleReadingDto> findAll(Pageable pageable);

    Page<BibleReadingDto> findByMemberId(UUID memberId, Pageable pageable);

    Page<BibleReadingDto> findByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable);

    BibleReadingDto findById(Long id);

    BibleReadingDto create(BibleReadingDto dto);

    BibleReadingDto update(Long id, BibleReadingDto dto);

    void delete(Long id);

    // Untuk quick check-in hari ini
    BibleReadingDto checkInToday(UUID memberId, String bookName, Integer chapter);

    // Cek apakah member sudah membaca hari ini
    boolean hasReadToday(UUID memberId);

    // Get statistik member
    List<BibleReadingDto> getMemberReadingHistory(UUID memberId, int days);
}
