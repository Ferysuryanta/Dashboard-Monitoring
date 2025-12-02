package com.mamregbkp.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class MemberDto {
    private UUID id;
    private String firstName;
    private String lastName;
    private String gender;
    private LocalDate birthDate;
    private String phone;
    private String email;
    private String address;
    private String status;
    private String sectorName;
    private String positionName;
    private LocalDate joinedDate;
}
