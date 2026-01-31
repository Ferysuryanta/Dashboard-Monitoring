package com.mamregbkp.controller;

import com.mamregbkp.dto.BibleReadingDto;
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
        BibleReadingDto dto = bibleReadingService.findById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
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
        try {
            BibleReadingDto created = bibleReadingService.create(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BibleReadingDto> update(@PathVariable Long id, @RequestBody BibleReadingDto dto) {
        try {
            BibleReadingDto updated = bibleReadingService.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            bibleReadingService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Quick check-in untuk hari ini
    @PostMapping("/check-in")
    public ResponseEntity<BibleReadingDto> checkInToday(@RequestBody Map<String, Object> payload) {
        try {
            UUID memberId = UUID.fromString((String) payload.get("memberId"));
            String bookName = (String) payload.getOrDefault("bookName", "");
            Integer chapter = payload.get("chapter") != null ? (Integer) payload.get("chapter") : null;

            BibleReadingDto result = bibleReadingService.checkInToday(memberId, bookName, chapter);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
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
}
