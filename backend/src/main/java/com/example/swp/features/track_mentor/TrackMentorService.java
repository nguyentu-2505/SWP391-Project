package com.example.swp.features.track_mentor;

import com.example.swp.features.track_mentor.dto.response.TrackMentorResponse;
import com.example.swp.features.user.dto.UserResponse;

import java.util.List;

public interface TrackMentorService {
    TrackMentorResponse assignMentorToTrack(Long trackId, Long mentorId);
    void removeMentorFromTrack(Long trackMentorId);
    List<UserResponse> getMentorsByTrack(Long trackId);
    List<TrackMentorResponse> getAssignmentsByMentor(Long mentorId);
}
