package com.mamregbkp.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AttendanceDto {
    private Long id;
    private String memberName;
    private LocalDate attendDate;
    private String event;
    private Boolean present;
    private String note;
}
