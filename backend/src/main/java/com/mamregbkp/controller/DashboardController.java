package com.mamregbkp.controller;

import com.mamregbkp.dto.*;
import com.mamregbkp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/members/count-by-sector")
    public List<SectorCountDto> countBySector() {
        return dashboardService.countMembersBySector();
    }

    @GetMapping("/attendance/summary")
    public AttendanceSummaryDto attendanceSummary() {
        YearMonth currentMonth = YearMonth.now();

        return dashboardService.attendanceSummary(currentMonth);
    }

    @GetMapping("/summary-stats")
    public ResponseEntity<DashboardSummaryDto> summary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/members-trend")
    public ResponseEntity<List<MembersTrendPointDto>> membersTrend(@RequestParam(defaultValue = "12") int months) {
       return  ResponseEntity.ok(dashboardService.getMembersTrend(months));
    }

    @GetMapping("/sector-distribution")
    public ResponseEntity<List<SectorDistributionDto>> sectorDistribution() {
        return ResponseEntity.ok(dashboardService.getSectorDistribution());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecentMemberDto>> recentMembers(@RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(dashboardService.getRecentMembers(size));
    }

    @GetMapping("/gender-distribution")
    public ResponseEntity<List<GenderDistributionDto>> genderDistribution() {
        return ResponseEntity.ok(dashboardService.getGenderDistribution());
    }

    @GetMapping("/status-distribution")
    public ResponseEntity<List<StatusDistributionDto>> statusDistribution() {
        return ResponseEntity.ok(dashboardService.getStatusDistribution());
    }

    @GetMapping("/upcoming-birthdays")
    public ResponseEntity<List<UpcomingBirthdayDto>> upcomingBirthdays(
            @RequestParam(defaultValue = "30") int days,
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getUpcomingBirthdays(days, limit));
    }

    @GetMapping("/bible-reading-progress")
    public ResponseEntity<List<BibleReadingProgressDto>> bibleReadingProgress(
            @RequestParam(defaultValue = "0") int year) {
        // Jika year = 0, gunakan tahun sekarang
        int targetYear = year > 0 ? year : java.time.LocalDate.now().getYear();
        return ResponseEntity.ok(dashboardService.getBibleReadingProgress(targetYear));
    }

    /**
     * Laporan Bulanan Baca Alkitab per Sektor (MAMRE BACA ALKITAB)
     * Returns report with: Nama Sektor, Jumlah Anggota, Rata-rata % Baca, Kategori, Keterangan
     */
    @GetMapping("/sector-bible-reading-report")
    public ResponseEntity<List<SectorBibleReadingReportDto>> sectorBibleReadingReport(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        return ResponseEntity.ok(dashboardService.getSectorBibleReadingReport(year, month));
    }

    /**
     * Laporan Kehadiran Bulanan per Sektor
     * Returns report with: Per Minggu (Minggu 1-4), Jumlah Anggota, Hadir, Kolekte, % Kehadiran
     */
    @GetMapping("/sector-attendance-report")
    public ResponseEntity<List<SectorAttendanceReportDto>> sectorAttendanceReport(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month) {
        return ResponseEntity.ok(dashboardService.getSectorAttendanceReport(year, month));
    }

}
