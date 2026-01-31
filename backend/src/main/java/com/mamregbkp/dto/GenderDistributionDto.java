package com.mamregbkp.dto;

public class GenderDistributionDto {
    private String gender;
    private long count;

    public GenderDistributionDto() {}

    public GenderDistributionDto(String gender, long count) {
        this.gender = gender;
        this.count = count;
    }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
