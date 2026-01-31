package com.mamregbkp.service;

import com.mamregbkp.dto.BibleReadingDto;
import com.mamregbkp.model.BibleReading;
import com.mamregbkp.model.Member;
import com.mamregbkp.repository.BibleReadingRepository;
import com.mamregbkp.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class BibleReadingServiceImpl implements BibleReadingService {

    @Autowired
    private BibleReadingRepository bibleReadingRepository;

    @Autowired
    private MemberRepository memberRepository;

    private BibleReadingDto toDto(BibleReading entity) {
        BibleReadingDto dto = new BibleReadingDto();
        dto.setId(entity.getId());
        dto.setMemberId(entity.getMemberId());
        dto.setReadingDate(entity.getReadingDate());
        dto.setBookName(entity.getBookName());
        dto.setChapter(entity.getChapter());
        dto.setVerseStart(entity.getVerseStart());
        dto.setVerseEnd(entity.getVerseEnd());
        dto.setCompleted(entity.getCompleted());
        dto.setNotes(entity.getNotes());

        // Get member name
        if (entity.getMember() != null) {
            String fullName = (entity.getMember().getFirstName() != null ? entity.getMember().getFirstName() : "")
                    + " " + (entity.getMember().getLastName() != null ? entity.getMember().getLastName() : "");
            dto.setMemberName(fullName.trim());
        }

        return dto;
    }

    private BibleReading toEntity(BibleReadingDto dto) {
        BibleReading entity = new BibleReading();
        entity.setMemberId(dto.getMemberId());
        entity.setReadingDate(dto.getReadingDate());
        entity.setBookName(dto.getBookName());
        entity.setChapter(dto.getChapter());
        entity.setVerseStart(dto.getVerseStart());
        entity.setVerseEnd(dto.getVerseEnd());
        entity.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : true);
        entity.setNotes(dto.getNotes());
        return entity;
    }

    @Override
    public Page<BibleReadingDto> findAll(Pageable pageable) {
        try {
            Page<BibleReading> page = bibleReadingRepository.findAll(pageable);
            List<BibleReadingDto> dtos = page.getContent().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            return new PageImpl<>(dtos, pageable, page.getTotalElements());
        } catch (Exception e) {
            // Jika tabel belum ada, return empty page
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }

    @Override
    public Page<BibleReadingDto> findByMemberId(UUID memberId, Pageable pageable) {
        try {
            List<BibleReading> readings = bibleReadingRepository.findByMemberIdOrderByReadingDateDesc(memberId);
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), readings.size());

            List<BibleReadingDto> dtos = readings.subList(start, end).stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());

            return new PageImpl<>(dtos, pageable, readings.size());
        } catch (Exception e) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }

    @Override
    public Page<BibleReadingDto> findByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        try {
            // Simple implementation - fetch all in range and paginate manually
            List<BibleReading> allReadings = bibleReadingRepository.findAll();
            List<BibleReading> filtered = allReadings.stream()
                    .filter(r -> !r.getReadingDate().isBefore(startDate) && !r.getReadingDate().isAfter(endDate))
                    .sorted((a, b) -> b.getReadingDate().compareTo(a.getReadingDate()))
                    .collect(Collectors.toList());

            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filtered.size());

            List<BibleReadingDto> dtos = filtered.subList(start, end).stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());

            return new PageImpl<>(dtos, pageable, filtered.size());
        } catch (Exception e) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }
    }

    @Override
    public BibleReadingDto findById(Long id) {
        try {
            return bibleReadingRepository.findById(id)
                    .map(this::toDto)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public BibleReadingDto create(BibleReadingDto dto) {
        // Validate member exists
        if (dto.getMemberId() != null) {
            Optional<Member> member = memberRepository.findById(dto.getMemberId());
            if (member.isEmpty()) {
                throw new RuntimeException("Member not found with id: " + dto.getMemberId());
            }
        }

        if (dto.getReadingDate() == null) {
            dto.setReadingDate(LocalDate.now());
        }

        BibleReading entity = toEntity(dto);
        BibleReading saved = bibleReadingRepository.save(entity);
        return toDto(saved);
    }

    @Override
    public BibleReadingDto update(Long id, BibleReadingDto dto) {
        BibleReading existing = bibleReadingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bible reading not found with id: " + id));

        if (dto.getMemberId() != null) existing.setMemberId(dto.getMemberId());
        if (dto.getReadingDate() != null) existing.setReadingDate(dto.getReadingDate());
        if (dto.getBookName() != null) existing.setBookName(dto.getBookName());
        if (dto.getChapter() != null) existing.setChapter(dto.getChapter());
        if (dto.getVerseStart() != null) existing.setVerseStart(dto.getVerseStart());
        if (dto.getVerseEnd() != null) existing.setVerseEnd(dto.getVerseEnd());
        if (dto.getCompleted() != null) existing.setCompleted(dto.getCompleted());
        if (dto.getNotes() != null) existing.setNotes(dto.getNotes());

        BibleReading saved = bibleReadingRepository.save(existing);
        return toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!bibleReadingRepository.existsById(id)) {
            throw new RuntimeException("Bible reading not found with id: " + id);
        }
        bibleReadingRepository.deleteById(id);
    }

    @Override
    public BibleReadingDto checkInToday(UUID memberId, String bookName, Integer chapter) {
        BibleReadingDto dto = new BibleReadingDto();
        dto.setMemberId(memberId);
        dto.setReadingDate(LocalDate.now());
        dto.setBookName(bookName);
        dto.setChapter(chapter);
        dto.setCompleted(true);
        return create(dto);
    }

    @Override
    public boolean hasReadToday(UUID memberId) {
        try {
            LocalDate today = LocalDate.now();
            List<BibleReading> readings = bibleReadingRepository.findByMemberIdAndReadingDateBetween(memberId, today, today);
            return !readings.isEmpty() && readings.stream().anyMatch(BibleReading::getCompleted);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<BibleReadingDto> getMemberReadingHistory(UUID memberId, int days) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(days);
            List<BibleReading> readings = bibleReadingRepository.findByMemberIdAndReadingDateBetween(memberId, startDate, endDate);
            return readings.stream()
                    .map(this::toDto)
                    .sorted((a, b) -> b.getReadingDate().compareTo(a.getReadingDate()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
