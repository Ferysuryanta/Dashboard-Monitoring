package com.mamregbkp.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AttendanceDto {
    private Long id;
    private String memberName;
    private LocalDate attendDate;
    private String event;
    private Boolean present;
    private BigDecimal kolpiAmount;  // Jumlah Kolekte/Persembahan
    private String note;
}
