package com.mamregbkp.service;

import com.mamregbkp.dto.*;

import java.time.YearMonth;
import java.util.List;

public interface DashboardService {
    List<SectorCountDto> countMembersBySector();
    AttendanceSummaryDto attendanceSummary(YearMonth month);

    DashboardSummaryDto getSummary();
    List<MembersTrendPointDto> getMembersTrend(int months);
    List<SectorDistributionDto> getSectorDistribution();
    List<RecentMemberDto> getRecentMembers(int size);

    // New features
    List<GenderDistributionDto> getGenderDistribution();
    List<StatusDistributionDto> getStatusDistribution();
    List<UpcomingBirthdayDto> getUpcomingBirthdays(int days, int limit);

    // Bible Reading Progress - Membaca Alkitab Mamre
    List<BibleReadingProgressDto> getBibleReadingProgress(int year);

    // Laporan Bulanan Baca Alkitab per Sektor (MAMRE BACA ALKITAB)
    List<SectorBibleReadingReportDto> getSectorBibleReadingReport(int year, int month);

    // Laporan Kehadiran Bulanan per Sektor (dengan data mingguan, kolekte, % kehadiran)
    List<SectorAttendanceReportDto> getSectorAttendanceReport(int year, int month);
}
