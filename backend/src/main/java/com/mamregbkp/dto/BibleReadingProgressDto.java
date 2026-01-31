package com.mamregbkp.dto;

public class BibleReadingProgressDto {
    private String month;
    private int targetDays;      // Target hari yang harus dibaca dalam bulan
    private int completedDays;   // Hari yang sudah selesai dibaca
    private double percentage;   // Persentase pencapaian

    public BibleReadingProgressDto() {}

    public BibleReadingProgressDto(String month, int targetDays, int completedDays) {
        this.month = month;
        this.targetDays = targetDays;
        this.completedDays = completedDays;
        this.percentage = targetDays > 0 ? (double) completedDays / targetDays * 100 : 0;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public int getTargetDays() { return targetDays; }
    public void setTargetDays(int targetDays) { this.targetDays = targetDays; }

    public int getCompletedDays() { return completedDays; }
    public void setCompletedDays(int completedDays) { this.completedDays = completedDays; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
