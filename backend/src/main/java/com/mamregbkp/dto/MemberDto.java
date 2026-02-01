package com.mamregbkp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class MemberDto {
    private UUID id;

    @NotBlank(message = "Nama depan wajib diisi")
    @Size(min = 1, max = 100, message = "Nama depan harus 1-100 karakter")
    private String firstName;

    @Size(max = 100, message = "Nama belakang maksimal 100 karakter")
    private String lastName;

    @Pattern(regexp = "^(MALE|FEMALE|PRIA|WANITA)?$", message = "Gender harus MALE, FEMALE, PRIA, atau WANITA")
    private String gender;

    @Past(message = "Tanggal lahir harus di masa lalu")
    private LocalDate birthDate;

    @Pattern(regexp = "^[0-9+\\-\\s]*$", message = "Nomor telepon tidak valid")
    @Size(max = 20, message = "Nomor telepon maksimal 20 karakter")
    private String phone;

    @Email(message = "Format email tidak valid")
    @Size(max = 255, message = "Email maksimal 255 karakter")
    private String email;

    @Size(max = 500, message = "Alamat maksimal 500 karakter")
    private String address;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|DECEASED|MOVED)?$", message = "Status tidak valid")
    private String status;

    @Size(max = 100, message = "Nama sektor maksimal 100 karakter")
    private String sectorName;

    @Size(max = 100, message = "Nama jabatan maksimal 100 karakter")
    private String positionName;

    @PastOrPresent(message = "Tanggal bergabung tidak bisa di masa depan")
    private LocalDate joinedDate;
}
