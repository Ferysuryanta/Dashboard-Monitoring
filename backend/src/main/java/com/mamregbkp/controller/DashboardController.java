package com.mamregbkp.controller;

import com.mamregbkp.dto.*;
import com.mamregbkp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
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

}
