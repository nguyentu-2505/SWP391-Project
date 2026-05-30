package com.example.swp.features.user;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.user.dto.UserResponse;
import com.example.swp.features.user.dto.request.CreateUserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public UserResponse approveUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        auditLogService.logAction(
            "APPROVE_USER", 
            "User", 
            userId, 
            "approved: false", 
            "approved: true"
        );

        user.setApproved(true);
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findByApprovedTrue(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<UserResponse> getPendingUsers(Pageable pageable) {
        return userRepository.findByApprovedFalse(pageable).map(this::mapToResponse);
    }

    @Override
    public List<UserResponse> getUsersByRole(UserRole role) {
        return userRepository.findByRole(Role.valueOf(role.name())).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Error: Email is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setFptStudentId(request.getFptStudentId());
        user.setSchoolName(request.getSchoolName());
        user.setApproved(true);
        user.setVerified(true);
        
        User savedUser = userRepository.save(user);
        
        auditLogService.logAction("CREATE_USER", "User", savedUser.getId(), null, "User created: " + savedUser.getUsername());
        
        return mapToResponse(savedUser);
    }
    
    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        auditLogService.logAction(
            "DEACTIVATE_USER", 
            "User", 
            userId, 
            "isActive: true", 
            "isActive: false"
        );

        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .fptStudentId(user.getFptStudentId())
                .schoolName(user.getSchoolName())
                .approved(user.isApproved())
                .isActive(user.isActive())
                .build();
    }
}
