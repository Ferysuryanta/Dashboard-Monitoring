package com.mamregbkp.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BibleReadingDto {
    private Long id;
    private UUID memberId;
    private String memberName;
    private LocalDate readingDate;
    private String bookName;
    private Integer chapter;
    private Integer verseStart;
    private Integer verseEnd;
    private Boolean completed;
    private String notes;

}
