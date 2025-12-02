package com.mamregbkp.service;

import com.mamregbkp.dto.*;
import com.mamregbkp.model.Member;
import com.mamregbkp.repository.AttendanceRepository;
import com.mamregbkp.repository.MemberRepository;
import com.mamregbkp.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

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
        long sectors = memberRepository.count();
        long positions = memberRepository.count();
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
}
