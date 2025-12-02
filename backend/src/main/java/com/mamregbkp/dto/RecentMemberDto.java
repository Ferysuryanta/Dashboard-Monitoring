package com.mamregbkp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecentMemberDto {

    private UUID id;
    private String name;
    private String email;
    private String position;
    private String sector;
    private LocalDate joinedDate;
}
