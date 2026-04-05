package com.mamregbkp.controller;

import com.mamregbkp.dto.BibleReadingDto;
import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.service.BibleReadingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bible-reading")
public class BibleReadingController {

    @Autowired
    private BibleReadingService bibleReadingService;

    @GetMapping
    public ResponseEntity<Page<BibleReadingDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "readingDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(bibleReadingService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BibleReadingDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bibleReadingService.findById(id));
    }

    @GetMapping("/member/{memberId}")
    public ResponseEntity<Page<BibleReadingDto>> getByMember(
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bibleReadingService.findByMemberId(memberId, pageable));
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<BibleReadingDto>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bibleReadingService.findByDateRange(startDate, endDate, pageable));
    }

    @PostMapping
    public ResponseEntity<BibleReadingDto> create(@RequestBody BibleReadingDto dto) {
        BibleReadingDto created = bibleReadingService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BibleReadingDto> update(@PathVariable Long id, @RequestBody BibleReadingDto dto) {
        return ResponseEntity.ok(bibleReadingService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bibleReadingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Quick check-in untuk hari ini
    @PostMapping("/check-in")
    public ResponseEntity<BibleReadingDto> checkInToday(@RequestBody Map<String, Object> payload) {
        if (payload == null || payload.get("memberId") == null) {
            throw new BadRequestException("memberId wajib diisi");
        }

        UUID memberId;
        try {
            memberId = UUID.fromString(String.valueOf(payload.get("memberId")));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Format memberId tidak valid", ex);
        }

        String bookName = payload.get("bookName") != null ? String.valueOf(payload.get("bookName")) : "";
        Integer chapter = extractInteger(payload.get("chapter"));

        BibleReadingDto result = bibleReadingService.checkInToday(memberId, bookName, chapter);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    // Cek apakah member sudah membaca hari ini
    @GetMapping("/has-read-today/{memberId}")
    public ResponseEntity<Map<String, Boolean>> hasReadToday(@PathVariable UUID memberId) {
        boolean hasRead = bibleReadingService.hasReadToday(memberId);
        return ResponseEntity.ok(Map.of("hasRead", hasRead));
    }

    // Get reading history untuk member
    @GetMapping("/history/{memberId}")
    public ResponseEntity<List<BibleReadingDto>> getMemberHistory(
            @PathVariable UUID memberId,
            @RequestParam(defaultValue = "30") int days) {

        List<BibleReadingDto> history = bibleReadingService.getMemberReadingHistory(memberId, days);
        return ResponseEntity.ok(history);
    }

    private Integer extractInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }

        try {
            return Integer.valueOf(String.valueOf(value));
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Format chapter tidak valid", ex);
        }
    }
}
