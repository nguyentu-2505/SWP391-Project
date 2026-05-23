package com.example.swp.features.user;

import com.example.swp.features.user.dto.UserResponse;
import com.example.swp.features.user.dto.request.CreateUserRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    UserResponse approveUser(Long userId);
    Page<UserResponse> getAllUsers(Pageable pageable);
    Page<UserResponse> getPendingUsers(Pageable pageable);
    List<UserResponse> getUsersByRole(UserRole role);
    UserResponse createUser(CreateUserRequest request);
    void deactivateUser(Long userId);
}
