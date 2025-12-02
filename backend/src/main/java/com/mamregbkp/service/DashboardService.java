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
}
