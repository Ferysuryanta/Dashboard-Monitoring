package com.mamregbkp.dto;

import com.mamregbkp.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserDto user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private UUID id;
        private String username;
        private String email;
        private String fullName;
        private UserRole role;
        private String avatarUrl;
        private String phone;
        private UUID memberId;
    }
}
