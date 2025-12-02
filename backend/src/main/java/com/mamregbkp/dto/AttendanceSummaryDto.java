package com.mamregbkp.dto;

import lombok.Data;

@Data
public class AttendanceSummaryDto {
    private String month; // YYYY-MM
    private Long totalAttendances;
    private Long uniqueMembers;
}
