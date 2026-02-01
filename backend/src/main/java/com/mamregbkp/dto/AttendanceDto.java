package com.mamregbkp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AttendanceDto {
    private Long id;

    @NotBlank(message = "Nama member wajib diisi")
    @Size(max = 200, message = "Nama member maksimal 200 karakter")
    private String memberName;

    @NotNull(message = "Tanggal kehadiran wajib diisi")
    @PastOrPresent(message = "Tanggal kehadiran tidak bisa di masa depan")
    private LocalDate attendDate;

    @Size(max = 100, message = "Nama event maksimal 100 karakter")
    private String event;

    private Boolean present;

    @DecimalMin(value = "0", message = "Kolpi amount tidak boleh negatif")
    @Digits(integer = 10, fraction = 2, message = "Format kolpi amount tidak valid")
    private BigDecimal kolpiAmount;  // Jumlah Kolekte/Persembahan

    @Size(max = 500, message = "Catatan maksimal 500 karakter")
    private String note;
}
