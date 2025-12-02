package com.mamregbkp.exception;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class ErrorResponse {
    private String message;
    private String path;
    private OffsetDateTime timestamp = OffsetDateTime.now();
}
