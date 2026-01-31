package com.mamregbkp.service;

import com.mamregbkp.dto.*;
import com.mamregbkp.model.Member;
import com.mamregbkp.repository.AttendanceRepository;
import com.mamregbkp.repository.BibleReadingRepository;
import com.mamregbkp.repository.MemberRepository;
import com.mamregbkp.repository.PositionRepository;
import com.mamregbkp.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private BibleReadingRepository bibleReadingRepository;

    @Override
    public List<SectorCountDto> countMembersBySector() {
        return sectorRepository.findAll().stream().map(s -> {
            long count = memberRepository.countBySectorId(s.getId());
            SectorCountDto dto = new SectorCountDto();
            dto.setSectorId(s.getId());
            dto.setSectorName(s.getName());
            dto.setMemberCount(count);
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public AttendanceSummaryDto attendanceSummary(YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        long totalAttendances = attendanceRepository.countByAttendDateBetween(start, end);
        long uniqueMembers = attendanceRepository.countDistinctMemberByAttendDateBetween(start, end);
        AttendanceSummaryDto dto = new AttendanceSummaryDto();
        dto.setMonth(month.toString());
        dto.setTotalAttendances(totalAttendances);
        dto.setUniqueMembers(uniqueMembers);
        return dto;
    }


    @Override
    public DashboardSummaryDto getSummary() {
        long total = memberRepository.count();
        long active = memberRepository.countByStatus("ACTIVE");
        long sectors = sectorRepository.count();
        long positions = positionRepository.count();
        return new DashboardSummaryDto(total, active, sectors, positions);
    }

    @Override
    public List<MembersTrendPointDto> getMembersTrend(int months) {
        if (months <= 0) months = 12;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM-yyyy", Locale.ENGLISH);
        LocalDate from = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<Member> recentMembers = memberRepository.findByJoinedDateAfter(from.minusDays(1)); // include day 1

        // group by YearMonth
        Map<YearMonth, Long> grouped = recentMembers.stream()
                .filter(m -> m.getJoinedDate() != null)
                .collect(Collectors.groupingBy(m -> YearMonth.from(m.getJoinedDate()), Collectors.counting()));

        // build result for each month (ascending)
        List<MembersTrendPointDto> out = new ArrayList<>();
        YearMonth start = YearMonth.from(from);
        for (int i = 0; i <= months; i++) {
            YearMonth ym = start.plusMonths(i);
            long c = grouped.getOrDefault(ym, 0L);
            String formattedMonth = ym.format(formatter);
            out.add(new MembersTrendPointDto(formattedMonth, c));
        }
        return out;
    }

    @Override
    public List<SectorDistributionDto> getSectorDistribution() {
        // fetch all members and group by sector name
        List<Member> all = memberRepository.findAll();
        Map<String, Long> grouping = all.stream()
                .collect(Collectors.groupingBy(m -> {
                    if (m.getSector() == null) return "Unassigned";
                    String name = m.getSector().getName();
                    return name == null ? "Unassigned" : name;
                }, Collectors.counting()));

        // convert to DTO and sort descending
        return grouping.entrySet().stream()
                .map(e -> new SectorDistributionDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(SectorDistributionDto::getCount).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<RecentMemberDto> getRecentMembers(int size) {
        if (size <= 0) size = 6;
        var page = memberRepository.findAll(PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "joinedDate")));
        return page.stream().map(m -> {
            String fullname = String.join(" ", Optional.ofNullable(m.getFirstName()).orElse(""), Optional.ofNullable(m.getLastName()).orElse("")).trim();
            return new RecentMemberDto(m.getId(), fullname, m.getEmail(), m.getPosition() != null ? m.getPosition().getName() : null,
                    m.getSector() != null ? m.getSector().getName() : null, m.getJoinedDate());
        }).collect(Collectors.toList());
    }

    @Override
    public List<GenderDistributionDto> getGenderDistribution() {
        List<Member> all = memberRepository.findAll();
        Map<String, Long> grouping = all.stream()
                .collect(Collectors.groupingBy(m -> {
                    String gender = m.getGender();
                    if (gender == null || gender.trim().isEmpty()) return "Unknown";
                    return gender;
                }, Collectors.counting()));

        return grouping.entrySet().stream()
                .map(e -> new GenderDistributionDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(GenderDistributionDto::getCount).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<StatusDistributionDto> getStatusDistribution() {
        List<Member> all = memberRepository.findAll();
        Map<String, Long> grouping = all.stream()
                .collect(Collectors.groupingBy(m -> {
                    String status = m.getStatus();
                    if (status == null || status.trim().isEmpty()) return "Unknown";
                    return status;
                }, Collectors.counting()));

        return grouping.entrySet().stream()
                .map(e -> new StatusDistributionDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(StatusDistributionDto::getCount).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<UpcomingBirthdayDto> getUpcomingBirthdays(int days, int limit) {
        if (days <= 0) days = 30;
        if (limit <= 0) limit = 5;

        LocalDate today = LocalDate.now();
        int currentYear = today.getYear();

        List<Member> all = memberRepository.findAll();

        final int finalDays = days;
        final int finalLimit = limit;

        return all.stream()
                .filter(m -> m.getBirthDate() != null)
                .map(m -> {
                    LocalDate birthDate = m.getBirthDate();
                    // Calculate birthday this year
                    LocalDate birthdayThisYear = birthDate.withYear(currentYear);

                    // If birthday already passed this year, check next year
                    if (birthdayThisYear.isBefore(today)) {
                        birthdayThisYear = birthDate.withYear(currentYear + 1);
                    }

                    long daysUntil = java.time.temporal.ChronoUnit.DAYS.between(today, birthdayThisYear);

                    String fullname = String.join(" ",
                            Optional.ofNullable(m.getFirstName()).orElse(""),
                            Optional.ofNullable(m.getLastName()).orElse("")).trim();

                    return new UpcomingBirthdayDto(
                            m.getId(),
                            fullname,
                            m.getBirthDate(),
                            (int) daysUntil,
                            m.getSector() != null ? m.getSector().getName() : null,
                            m.getPosition() != null ? m.getPosition().getName() : null
                    );
                })
                .filter(dto -> dto.getDaysUntil() >= 0 && dto.getDaysUntil() <= finalDays)
                .sorted(Comparator.comparingInt(UpcomingBirthdayDto::getDaysUntil))
                .limit(finalLimit)
                .collect(Collectors.toList());
    }

    @Override
    public List<BibleReadingProgressDto> getBibleReadingProgress(int year) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM-yyyy", Locale.ENGLISH);
        List<BibleReadingProgressDto> result = new ArrayList<>();

        LocalDate today = LocalDate.now();

        // Jika year = 0 atau tidak valid, tampilkan 12 bulan terakhir
        if (year <= 0) {
            // 12 bulan terakhir (termasuk bulan ini)
            for (int i = 11; i >= 0; i--) {
                YearMonth ym = YearMonth.from(today).minusMonths(i);
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();

                // Jika bulan ini, end = hari ini
                if (ym.equals(YearMonth.from(today))) {
                    end = today;
                }

                int targetDays = ym.lengthOfMonth();
                int completedDays = 0;

                try {
                    completedDays = (int) bibleReadingRepository.countDistinctReadingDaysBetween(start, end);
                } catch (Exception e) {
                    // Jika error, return 0
                }

                String monthLabel = ym.format(formatter);
                result.add(new BibleReadingProgressDto(monthLabel, targetDays, completedDays));
            }
        } else {
            // Jika year spesifik, tampilkan per bulan dalam tahun tersebut
            int currentYear = today.getYear();

            for (int month = 1; month <= 12; month++) {
                YearMonth ym = YearMonth.of(year, month);
                LocalDate start = ym.atDay(1);
                LocalDate end = ym.atEndOfMonth();

                int targetDays = ym.lengthOfMonth();
                int completedDays = 0;

                // Hanya hitung jika bulan sudah lewat atau bulan ini
                if (year < currentYear || (year == currentYear && month <= today.getMonthValue())) {
                    try {
                        completedDays = (int) bibleReadingRepository.countDistinctReadingDaysBetween(start, end);
                    } catch (Exception e) {
                        completedDays = 0;
                    }
                }

                String monthLabel = ym.format(DateTimeFormatter.ofPattern("MMM", Locale.ENGLISH));
                result.add(new BibleReadingProgressDto(monthLabel, targetDays, completedDays));
            }
        }

        return result;
    }

    @Override
    public List<SectorBibleReadingReportDto> getSectorBibleReadingReport(int year, int month) {
        List<SectorBibleReadingReportDto> result = new ArrayList<>();

        LocalDate today = LocalDate.now();

        // Default to current year and month if not specified
        int targetYear = year > 0 ? year : today.getYear();
        int targetMonth = (month > 0 && month <= 12) ? month : today.getMonthValue();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        // If current month, use today as end date
        if (ym.equals(YearMonth.from(today))) {
            endDate = today;
        }

        // Get all sectors
        List<com.mamregbkp.model.Sector> sectors = sectorRepository.findAll();

        // Get all member IDs who read in the date range
        List<UUID> memberIdsWhoRead;
        try {
            memberIdsWhoRead = bibleReadingRepository.findDistinctMemberIdsByDateRange(startDate, endDate);
        } catch (Exception e) {
            memberIdsWhoRead = new ArrayList<>();
        }

        // Convert to Set for faster lookup
        Set<UUID> memberIdsWhoReadSet = new HashSet<>(memberIdsWhoRead);

        // Get all members with their sector
        List<Member> allMembers = memberRepository.findAll();

        // Group members by sector
        Map<Long, List<Member>> membersBySector = allMembers.stream()
                .filter(m -> m.getSector() != null)
                .collect(Collectors.groupingBy(m -> m.getSector().getId()));

        int totalAllMembers = 0;
        int totalAllMembersWhoRead = 0;

        for (com.mamregbkp.model.Sector sector : sectors) {
            List<Member> sectorMembers = membersBySector.getOrDefault(sector.getId(), new ArrayList<>());
            int totalMembers = sectorMembers.size();

            // Count how many members in this sector have read
            int membersWhoRead = (int) sectorMembers.stream()
                    .filter(m -> memberIdsWhoReadSet.contains(m.getId()))
                    .count();

            totalAllMembers += totalMembers;
            totalAllMembersWhoRead += membersWhoRead;

            result.add(new SectorBibleReadingReportDto(
                    sector.getId(),
                    sector.getName(),
                    totalMembers,
                    membersWhoRead
            ));
        }

        // Sort by sector name
        result.sort(Comparator.comparing(SectorBibleReadingReportDto::getSectorName));

        // Add total row at the end (optional - can be identified by sectorId = null)
        SectorBibleReadingReportDto totalRow = new SectorBibleReadingReportDto(
                null,
                "Total",
                totalAllMembers,
                totalAllMembersWhoRead
        );
        result.add(totalRow);

        return result;
    }

    @Override
    public List<SectorAttendanceReportDto> getSectorAttendanceReport(int year, int month) {
        List<SectorAttendanceReportDto> result = new ArrayList<>();

        LocalDate today = LocalDate.now();

        // Default to current year and month if not specified
        int targetYear = year > 0 ? year : today.getYear();
        int targetMonth = (month > 0 && month <= 12) ? month : today.getMonthValue();

        YearMonth ym = YearMonth.of(targetYear, targetMonth);

        // Get all sectors
        List<com.mamregbkp.model.Sector> sectors = sectorRepository.findAll();

        // Get all members grouped by sector
        List<Member> allMembers = memberRepository.findAll();
        Map<Long, List<Member>> membersBySector = allMembers.stream()
                .filter(m -> m.getSector() != null)
                .collect(Collectors.groupingBy(m -> m.getSector().getId()));

        for (com.mamregbkp.model.Sector sector : sectors) {
            List<Member> sectorMembers = membersBySector.getOrDefault(sector.getId(), new ArrayList<>());
            int totalMembers = sectorMembers.size();

            // Calculate weekly data (4 weeks in a month)
            List<WeeklyAttendanceDto> weeklyData = new ArrayList<>();

            for (int week = 1; week <= 4; week++) {
                // Calculate week start and end dates
                LocalDate weekStart;
                LocalDate weekEnd;

                if (week == 1) {
                    weekStart = ym.atDay(1);
                    weekEnd = ym.atDay(Math.min(7, ym.lengthOfMonth()));
                } else if (week == 2) {
                    weekStart = ym.atDay(8);
                    weekEnd = ym.atDay(Math.min(14, ym.lengthOfMonth()));
                } else if (week == 3) {
                    weekStart = ym.atDay(15);
                    weekEnd = ym.atDay(Math.min(21, ym.lengthOfMonth()));
                } else {
                    weekStart = ym.atDay(22);
                    weekEnd = ym.atEndOfMonth();
                }

                // Only count if dates are in the past or today
                int attendedCount = 0;
                BigDecimal kolpiAmount = BigDecimal.ZERO;

                if (!weekStart.isAfter(today)) {
                    try {
                        // Count distinct members who attended
                        attendedCount = (int) attendanceRepository.countDistinctMembersBySectorAndDateRange(
                                sector.getId(), weekStart, weekEnd);

                        // Sum kolpi amount
                        kolpiAmount = attendanceRepository.sumKolpiBySectorAndDateRange(
                                sector.getId(), weekStart, weekEnd);
                        if (kolpiAmount == null) {
                            kolpiAmount = java.math.BigDecimal.ZERO;
                        }
                    } catch (Exception e) {
                        attendedCount = 0;
                    }
                }

                weeklyData.add(new WeeklyAttendanceDto(week, totalMembers, attendedCount, kolpiAmount));
            }

            result.add(new SectorAttendanceReportDto(
                    sector.getId(),
                    sector.getName(),
                    totalMembers,
                    weeklyData
            ));
        }

        // Sort by sector name
        result.sort(Comparator.comparing(SectorAttendanceReportDto::getSectorName));

        return result;
    }
}
