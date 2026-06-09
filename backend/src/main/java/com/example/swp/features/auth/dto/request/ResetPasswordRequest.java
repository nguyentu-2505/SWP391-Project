package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token cannot be empty")
    private String token;

    @NotBlank(message = "New password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    public String getToken() { return token; }
    public String getNewPassword() { return newPassword; }
}
