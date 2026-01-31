package com.mamregbkp.dto;

import lombok.*;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BibleReadingProgressDto {
    private String month;
    private int targetDays;      // Target hari yang harus dibaca dalam bulan
    private int completedDays;   // Hari yang sudah selesai dibaca
    private double percentage;   // Persentase pencapaian

    public BibleReadingProgressDto(String month, int targetDays, int completedDays) {
        this.month = month;
        this.targetDays = targetDays;
        this.completedDays = completedDays;
        this.percentage = targetDays > 0 ? (double) completedDays / targetDays * 100 : 0;
    }

}
