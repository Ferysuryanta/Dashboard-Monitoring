package com.mamregbkp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO untuk Laporan Kehadiran Bulanan per Sektor
 * Format sesuai bisnis proses: Per Minggu dengan Jumlah Anggota, Hadir, Kolekte, % Kehadiran
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorAttendanceReportDto {

    private Long sectorId;
    private String sectorName;
    private int totalMembers;                    // Jumlah Anggota di sektor
    private List<WeeklyAttendanceDto> weeklyData; // Data per minggu (Minggu 1-4)

    // Summary (Total & Average)
    private int totalAttended;                   // Total hadir dalam bulan
    private BigDecimal totalKolpiAmount;        // Total kolekte dalam bulan
    private double averageAttendancePercentage;  // Rata-rata % kehadiran

    /**
     * Constructor dengan perhitungan otomatis summary
     */
    public SectorAttendanceReportDto(Long sectorId, String sectorName, int totalMembers, List<WeeklyAttendanceDto> weeklyData) {
        this.sectorId = sectorId;
        this.sectorName = sectorName;
        this.totalMembers = totalMembers;
        this.weeklyData = weeklyData != null ? weeklyData : new ArrayList<>();
        calculateSummary();
    }

    /**
     * Menghitung Total dan Average dari data mingguan
     */
    private void calculateSummary() {
        if (weeklyData == null || weeklyData.isEmpty()) {
            this.totalAttended = 0;
            this.totalKolpiAmount = BigDecimal.ZERO;
            this.averageAttendancePercentage = 0;
            return;
        }

        int sumAttended = 0;
        BigDecimal sumKolpi = BigDecimal.ZERO;
        double sumPercentage = 0;
        int weeksWithData = 0;

        for (WeeklyAttendanceDto week : weeklyData) {
            sumAttended += week.getAttendedCount();
            sumKolpi = sumKolpi.add(week.getKolpiAmount() != null ? week.getKolpiAmount() : BigDecimal.ZERO);

            // Count weeks that have attendance data (attendedCount > 0)
            if (week.getAttendedCount() > 0) {
                sumPercentage += week.getAttendancePercentage();
                weeksWithData++;
            }
        }

        this.totalAttended = sumAttended;
        this.totalKolpiAmount = sumKolpi;

        // Calculate average: if there are weeks with data, use average; otherwise 0
        this.averageAttendancePercentage = weeksWithData > 0 ? sumPercentage / weeksWithData : 0;
    }

    /**
     * Recalculate summary when weekly data changes
     */
    public void setWeeklyData(List<WeeklyAttendanceDto> weeklyData) {
        this.weeklyData = weeklyData;
        calculateSummary();
    }
}
