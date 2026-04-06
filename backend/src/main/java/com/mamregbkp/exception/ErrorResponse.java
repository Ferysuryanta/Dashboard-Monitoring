package com.mamregbkp.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String error;
    private String code;
    private String message;
    private String path;
    private List<String> details;
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public static ErrorResponse of(HttpStatus status, String code, String message, String path) {
        return of(status, code, message, path, List.of());
    }

    public static ErrorResponse of(HttpStatus status, String code, String message, String path, List<String> details) {
        return ErrorResponse.builder()
                .status(status.value())
                .error(status.getReasonPhrase())
                .code(code)
                .message(message)
                .path(path)
                .details(details)
                .timestamp(OffsetDateTime.now())
                .build();
    }
}
