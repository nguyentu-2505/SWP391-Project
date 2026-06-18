package com.example.swp.features.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Email cannot be empty")
    private String email;

    @NotBlank(message = "OTP Code cannot be empty")
    private String otpCode;

    @NotBlank(message = "New password cannot be empty")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String newPassword;

    public String getEmail() { return email; }
    public String getOtpCode() { return otpCode; }
    public String getNewPassword() { return newPassword; }
}
