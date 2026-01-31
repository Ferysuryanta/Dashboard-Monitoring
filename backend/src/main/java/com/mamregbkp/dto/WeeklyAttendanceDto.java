package com.mamregbkp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO untuk data kehadiran mingguan per sektor
 * Sesuai format: Minggu 1, Minggu 2, Minggu 3, Minggu 4
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyAttendanceDto {

    private int weekNumber;           // Minggu ke-1, 2, 3, 4
    private int totalMembers;         // Jumlah Anggota
    private int attendedCount;        // Hadir
    private BigDecimal kolpiAmount;  // Jumlah Kolekte (Kolpi)
    private double attendancePercentage; // % Kehadiran

    /**
     * Constructor dengan perhitungan otomatis persentase
     */
    public WeeklyAttendanceDto(int weekNumber, int totalMembers, int attendedCount, BigDecimal kolpiAmount) {
        this.weekNumber = weekNumber;
        this.totalMembers = totalMembers;
        this.attendedCount = attendedCount;
        this.kolpiAmount = kolpiAmount != null ? kolpiAmount : BigDecimal.ZERO;
        this.attendancePercentage = totalMembers > 0 ? ((double) attendedCount / totalMembers) * 100 : 0;
    }
}
