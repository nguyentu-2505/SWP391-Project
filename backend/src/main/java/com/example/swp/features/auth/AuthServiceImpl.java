package com.example.swp.features.auth;

import com.example.swp.features.auth.dto.request.CreateGuestJudgeRequest;
import com.example.swp.features.auth.dto.request.LoginRequest;
import com.example.swp.features.auth.dto.request.RefreshTokenRequest;
import com.example.swp.features.auth.dto.request.RegisterRequest;
import com.example.swp.features.auth.dto.request.VerifyOtpRequest;
import com.example.swp.features.auth.dto.response.LoginResponse;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.security.jwt.JwtTokenProvider;
import com.example.swp.util.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    @Override
    public LoginResponse login(LoginRequest request) {
        // Pre-check: give specific error messages instead of generic "Bad credentials"
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with username: " + request.getUsername()));

        log.info("Login attempt for user: {}, verified={}, approved={}", 
                user.getUsername(), user.isVerified(), user.isApproved());

        if (!user.isVerified()) {
            throw new RuntimeException("Account email has not been verified. Please verify your OTP first.");
        }

        if (!user.isApproved()) {
            throw new RuntimeException("Account has not been approved by admin yet.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("User logged in successfully: {}", user.getUsername());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String username = jwtTokenProvider.getUsernameFromJWT(request.getRefreshToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (jwtTokenProvider.validateToken(request.getRefreshToken())) {
            String accessToken = jwtTokenProvider.generateAccessToken(user);
            String refreshToken = jwtTokenProvider.generateRefreshToken(user);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();
        }
        throw new RuntimeException("Invalid refresh token");
    }

    @Override
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFptStudentId(request.getFptStudentId());
        user.setRole(Role.PARTICIPANT);
        user.setApproved(false);
        user.setVerified(false);

        String otp = String.format("%06d", SECURE_RANDOM.nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);
        log.info("New user registered successfully: {}", user.getUsername());

        String emailBody = "Your OTP for Hackathon registration is: " + otp;
        emailService.sendSimpleMessage(user.getEmail(), "Hackathon Registration OTP", emailBody);
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        if (user.isVerified()) {
            throw new RuntimeException("User is already verified.");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Invalid OTP.");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired.");
        }

        user.setVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    /**
     * Creates a temporary Guest Judge account on behalf of an Organizer.
     * WHY: Guest judges are external (non-FPT) evaluators who do not go through
     * the normal OTP registration flow. Organizer creates them directly and
     * sends credentials via email.
     *
     * Security:
     * - Guest judges get role GUEST_JUDGE (cannot mentor, cannot manage events)
     * - Account is marked is_temporary=true for easy cleanup post-event
     * - Auto-approved and auto-verified to bypass normal gating
     * - Password is randomly generated (12 chars, alphanumeric)
     * - Email failure will rollback transaction to prevent orphaned accounts.
     */
    @Override
    @Transactional
    public void createGuestJudge(CreateGuestJudgeRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        String tempPassword = generateTemporaryPassword(12);

        User guestJudge = new User();
        guestJudge.setUsername(request.getUsername());
        guestJudge.setEmail(request.getEmail());
        guestJudge.setFullName(request.getFullName());
        guestJudge.setPassword(passwordEncoder.encode(tempPassword));
        guestJudge.setRole(Role.GUEST_JUDGE);
        guestJudge.setApproved(true);      // auto-approved – no admin review needed
        guestJudge.setVerified(true);      // skip OTP – organizer vouches for them
        guestJudge.setTemporary(true);     // flag for post-event cleanup

        userRepository.save(guestJudge);
        log.info("Guest judge account created: username={}", guestJudge.getUsername());

        auditLogService.logAction(
            "CREATE_GUEST_JUDGE",
            "USER",
            guestJudge.getId(),
            null,
            request.getUsername()
        );

        // Send credentials to guest judge via email
        String emailBody = String.format(
            "You have been invited as a Guest Judge for SEAL Hackathon.\n\n" +
            "Login credentials:\n" +
            "  Username : %s\n" +
            "  Password : %s\n\n" +
            "Please change your password after first login.",
            request.getUsername(), tempPassword
        );
        emailService.sendSimpleMessage(request.getEmail(), "SEAL Hackathon – Guest Judge Account", emailBody);
    }

    /** Generates a cryptographically-random alphanumeric password of the given length. */
    private String generateTemporaryPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(SECURE_RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }
}
