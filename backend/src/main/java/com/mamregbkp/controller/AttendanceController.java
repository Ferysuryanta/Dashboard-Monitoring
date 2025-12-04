package com.mamregbkp.controller;

import com.mamregbkp.dto.AttendanceDto;
import com.mamregbkp.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<AttendanceDto> create(@RequestBody AttendanceDto dto) {
        return ResponseEntity.status(201).body(attendanceService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getById(id));
    }

    /**
     * List attendances.
     *
     * Query params:
     * - page (int)
     * - size (int)
     * - member (optional String) : either a UUID (member id) or a name/email to search by
     * - from (optional ISO date) : yyyy-MM-dd
     * - to (optional ISO date) : yyyy-MM-dd
     *
     * Examples:
     * GET /api/attendance?page=0&size=20&member=0123e456-...      -> filter by member UUID
     * GET /api/attendance?page=0&size=20&member=Sinta%20Jeruk      -> filter by member name
     * GET /api/attendance?page=0&size=20&member=sinta@example.com  -> filter by email
     */
    @GetMapping
    public ResponseEntity<Page<AttendanceDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String member,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,
            @RequestParam(required = false)
            @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE)
            LocalDate to) {

        Page<AttendanceDto> p = attendanceService.list(page, size, member, from, to);
        return ResponseEntity.ok(p);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDto> update(@PathVariable Long id, @RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
