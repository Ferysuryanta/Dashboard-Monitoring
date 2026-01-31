package com.mamregbkp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO untuk Laporan Bulanan Baca Alkitab per Sektor
 * Sesuai dengan format laporan MAMRE BACA ALKITAB
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SectorBibleReadingReportDto {

    private Long sectorId;
    private String sectorName;           // Nama Sektor
    private int totalMembers;            // Jumlah Anggota
    private int membersWhoRead;          // Jumlah anggota yang sudah membaca bulan ini
    private double averagePercentage;    // Rata-rata % Baca Bulan Ini
    private String category;             // Kategori: Sangat Baik, Baik, Cukup, Kurang, Sangat Kurang
    private String description;          // Keterangan berdasarkan kategori

    /**
     * Constructor dengan perhitungan otomatis kategori dan keterangan
     */
    public SectorBibleReadingReportDto(Long sectorId, String sectorName, int totalMembers, int membersWhoRead) {
        this.sectorId = sectorId;
        this.sectorName = sectorName;
        this.totalMembers = totalMembers;
        this.membersWhoRead = membersWhoRead;
        this.averagePercentage = totalMembers > 0 ? ((double) membersWhoRead / totalMembers) * 100 : 0;
        calculateCategoryAndDescription();
    }

    /**
     * Menentukan kategori dan keterangan berdasarkan persentase
     * - >= 80%: Sangat Baik
     * - >= 60%: Baik
     * - >= 40%: Cukup
     * - >= 20%: Kurang
     * - < 20%: Sangat Kurang
     */
    private void calculateCategoryAndDescription() {
        if (averagePercentage >= 80) {
            this.category = "Sangat Baik";
            this.description = "Konsistensi membaca Alkitab sangat tinggi, pertahankan!";
        } else if (averagePercentage >= 60) {
            this.category = "Baik";
            this.description = "Konsistensi baik, tingkatkan terus!";
        } else if (averagePercentage >= 40) {
            this.category = "Cukup";
            this.description = "Perlu peningkatan konsistensi membaca Alkitab";
        } else if (averagePercentage >= 20) {
            this.category = "Kurang";
            this.description = "Perlu motivasi lebih untuk membaca Alkitab";
        } else {
            this.category = "Sangat Kurang";
            this.description = "Perlu perhatian khusus untuk meningkatkan kebiasaan membaca Alkitab";
        }
    }

    /**
     * Recalculate category when percentage is set directly
     */
    public void setAveragePercentage(double averagePercentage) {
        this.averagePercentage = averagePercentage;
        calculateCategoryAndDescription();
    }
}
