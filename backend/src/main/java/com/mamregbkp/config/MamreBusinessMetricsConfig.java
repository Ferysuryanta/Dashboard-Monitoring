package com.mamregbkp.config;

import com.mamregbkp.dto.AttendanceSummaryDto;
import com.mamregbkp.dto.DashboardSummaryDto;
import com.mamregbkp.repository.ProgramRepository;
import com.mamregbkp.service.DashboardService;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.binder.MeterBinder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.YearMonth;

@Configuration
public class MamreBusinessMetricsConfig {

    @Bean
    public MeterBinder mamreBusinessMetrics(DashboardService dashboardService, ProgramRepository programRepository) {
        return registry -> {
            Gauge.builder("mamre.members.total", () -> summary(dashboardService).getTotalMembers())
                    .description("Jumlah total anggota Mamre")
                    .register(registry);

            Gauge.builder("mamre.members.active", () -> summary(dashboardService).getActiveMembers())
                    .description("Jumlah anggota aktif Mamre")
                    .register(registry);

            Gauge.builder("mamre.attendance.unique_members.current_month", () -> attendance(dashboardService).getUniqueMembers())
                    .description("Jumlah anggota unik yang tercatat hadir pada bulan berjalan")
                    .register(registry);

            Gauge.builder("mamre.attendance.total.current_month", () -> attendance(dashboardService).getTotalAttendances())
                    .description("Jumlah total catatan kehadiran pada bulan berjalan")
                    .register(registry);

            Gauge.builder("mamre.programs.total", programRepository::count)
                    .description("Jumlah total program Mamre")
                    .register(registry);

            Gauge.builder("mamre.programs.status", () -> programRepository.countByStatusIgnoreCase("PLANNED"))
                    .description("Jumlah program Mamre per status")
                    .tag("status", "PLANNED")
                    .register(registry);

            Gauge.builder("mamre.programs.status", () -> programRepository.countByStatusIgnoreCase("DONE"))
                    .description("Jumlah program Mamre per status")
                    .tag("status", "DONE")
                    .register(registry);
        };
    }

    private DashboardSummaryDto summary(DashboardService dashboardService) {
        DashboardSummaryDto summary = dashboardService.getSummary();
        return summary != null ? summary : new DashboardSummaryDto(0, 0, 0, 0);
    }

    private AttendanceSummaryDto attendance(DashboardService dashboardService) {
        AttendanceSummaryDto summary = dashboardService.attendanceSummary(YearMonth.now());
        if (summary == null) {
            summary = new AttendanceSummaryDto();
            summary.setMonth(YearMonth.now().toString());
            summary.setUniqueMembers(0L);
            summary.setTotalAttendances(0L);
        }
        return summary;
    }
}

