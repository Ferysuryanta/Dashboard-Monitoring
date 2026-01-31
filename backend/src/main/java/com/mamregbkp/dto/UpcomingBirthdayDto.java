package com.mamregbkp.dto;

import java.time.LocalDate;
import java.util.UUID;

public class UpcomingBirthdayDto {
    private UUID id;
    private String name;
    private LocalDate birthDate;
    private int daysUntil;
    private String sectorName;
    private String positionName;

    public UpcomingBirthdayDto() {}

    public UpcomingBirthdayDto(UUID id, String name, LocalDate birthDate, int daysUntil, String sectorName, String positionName) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.daysUntil = daysUntil;
        this.sectorName = sectorName;
        this.positionName = positionName;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDate getBirthDate() { return birthDate; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }

    public int getDaysUntil() { return daysUntil; }
    public void setDaysUntil(int daysUntil) { this.daysUntil = daysUntil; }

    public String getSectorName() { return sectorName; }
    public void setSectorName(String sectorName) { this.sectorName = sectorName; }

    public String getPositionName() { return positionName; }
    public void setPositionName(String positionName) { this.positionName = positionName; }
}
