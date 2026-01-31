package com.mamregbkp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 255, message = "Nama lengkap harus 3-255 karakter")
    private String fullName;

    @Email(message = "Format email tidak valid")
    private String email;

    @Size(max = 50, message = "Nomor telepon maksimal 50 karakter")
    private String phone;

    @Size(max = 500, message = "URL avatar maksimal 500 karakter")
    private String avatarUrl;
}
