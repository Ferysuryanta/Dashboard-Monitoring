package com.mamregbkp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Username wajib diisi")
    @Size(min = 3, max = 100, message = "Username harus 3-100 karakter")
    private String username;

    @NotBlank(message = "Email wajib diisi")
    @Email(message = "Format email tidak valid")
    private String email;

    @NotBlank(message = "Password wajib diisi")
    @Size(min = 6, message = "Password minimal 6 karakter")
    private String password;

    @NotBlank(message = "Konfirmasi password wajib diisi")
    private String confirmPassword;

    @NotBlank(message = "Nama lengkap wajib diisi")
    @Size(min = 3, max = 255, message = "Nama lengkap harus 3-255 karakter")
    private String fullName;

    private String phone;
}
