package com.mamregbkp.service;

import com.mamregbkp.dto.BibleReadingDto;
import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.exception.ResourceNotFoundException;
import com.mamregbkp.model.BibleReading;
import com.mamregbkp.repository.BibleReadingRepository;
import com.mamregbkp.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
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
        Page<BibleReading> page = bibleReadingRepository.findAll(pageable);
        List<BibleReadingDto> dtos = page.getContent().stream()
                .map(this::toDto)
                .toList();
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Override
    public Page<BibleReadingDto> findByMemberId(UUID memberId, Pageable pageable) {
        ensureMemberExists(memberId);

        List<BibleReading> readings = bibleReadingRepository.findByMemberIdOrderByReadingDateDesc(memberId);
        int start = (int) pageable.getOffset();
        if (start >= readings.size()) {
            return Page.empty(pageable);
        }

        int end = Math.min(start + pageable.getPageSize(), readings.size());
        List<BibleReadingDto> dtos = readings.subList(start, end).stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, readings.size());
    }

    @Override
    public Page<BibleReadingDto> findByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        validateDateRange(startDate, endDate);

        List<BibleReading> allReadings = bibleReadingRepository.findAll();
        List<BibleReading> filtered = allReadings.stream()
                .filter(r -> !r.getReadingDate().isBefore(startDate) && !r.getReadingDate().isAfter(endDate))
                .sorted((a, b) -> b.getReadingDate().compareTo(a.getReadingDate()))
                .toList();

        int start = (int) pageable.getOffset();
        if (start >= filtered.size()) {
            return Page.empty(pageable);
        }

        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<BibleReadingDto> dtos = filtered.subList(start, end).stream()
                .map(this::toDto)
                .toList();

        return new PageImpl<>(dtos, pageable, filtered.size());
    }

    @Override
    public BibleReadingDto findById(Long id) {
        return bibleReadingRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Data baca Alkitab tidak ditemukan: " + id));
    }

    @Override
    public BibleReadingDto create(BibleReadingDto dto) {
        validateCreateRequest(dto);
        ensureMemberExists(dto.getMemberId());

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
                .orElseThrow(() -> new ResourceNotFoundException("Data baca Alkitab tidak ditemukan: " + id));

        if (dto.getMemberId() != null) {
            ensureMemberExists(dto.getMemberId());
            existing.setMemberId(dto.getMemberId());
        }
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
            throw new ResourceNotFoundException("Data baca Alkitab tidak ditemukan: " + id);
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
        ensureMemberExists(memberId);

        LocalDate today = LocalDate.now();
        List<BibleReading> readings = bibleReadingRepository.findByMemberIdAndReadingDateBetween(memberId, today, today);
        return !readings.isEmpty() && readings.stream().anyMatch(BibleReading::getCompleted);
    }

    @Override
    public List<BibleReadingDto> getMemberReadingHistory(UUID memberId, int days) {
        ensureMemberExists(memberId);
        if (days <= 0) {
            throw new BadRequestException("Jumlah hari harus lebih besar dari 0");
        }

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);
        List<BibleReading> readings = bibleReadingRepository.findByMemberIdAndReadingDateBetween(memberId, startDate, endDate);
        return readings.stream()
                .map(this::toDto)
                .sorted((a, b) -> b.getReadingDate().compareTo(a.getReadingDate()))
                .collect(Collectors.toList());
    }

    private void validateCreateRequest(BibleReadingDto dto) {
        if (dto == null) {
            throw new BadRequestException("Data baca Alkitab wajib diisi");
        }
        if (dto.getMemberId() == null) {
            throw new BadRequestException("Member wajib diisi");
        }
    }

    private void ensureMemberExists(UUID memberId) {
        if (memberId == null) {
            throw new BadRequestException("Member wajib diisi");
        }

        if (!memberRepository.existsById(memberId)) {
            throw new ResourceNotFoundException("Member tidak ditemukan: " + memberId);
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("Tanggal mulai dan tanggal akhir wajib diisi");
        }

        if (startDate.isAfter(endDate)) {
            throw new BadRequestException("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
        }
    }
}
