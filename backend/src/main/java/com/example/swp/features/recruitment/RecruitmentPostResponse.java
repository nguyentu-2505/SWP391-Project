package com.example.swp.features.recruitment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentPostResponse {
    private Long id;
    private String type;
    private String title;
    private String content;
    
    private Long userId;
    private String username;
    private String userEmail;
    
    private Long teamId;
    private String teamName;
    
    private Long eventId;
    private LocalDateTime createdAt;
}
