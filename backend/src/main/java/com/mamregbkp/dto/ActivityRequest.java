package com.mamregbkp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityRequest {
    private String title;
    private String description;
    private LocalDateTime dateStart;
    private LocalDateTime dateEnd;
    private String status;
    private String location;
}
