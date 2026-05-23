package com.example.swp.features.user;

import com.example.swp.features.user.dto.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse approveUser(Long userId);
    List<UserResponse> getAllUsers();
    List<UserResponse> getPendingUsers();
    UserResponse createUser(com.example.swp.features.user.dto.request.CreateUserRequest request);
}
