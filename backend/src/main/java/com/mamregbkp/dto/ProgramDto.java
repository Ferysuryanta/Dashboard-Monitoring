package com.mamregbkp.dto;

public class ProgramDto {
    public Long id;
    public String title;
    public String description;
    public String type;
    public String status;
    public String nextSchedule; // ISO string for convenience

    // extended fields
    public String place;
    public String purpose;
    public Integer targetPhysical;
    public Long budgetLocal;
    public Long budgetSubsidy;
    public Long budgetTotal;
    public String executor;
    public String scheduleText;
    public String notes;
    public String category;
}
