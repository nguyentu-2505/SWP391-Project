package com.example.swp.features.track_mentor;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.track_mentor.dto.request.AssignMentorRequest;
import com.example.swp.features.track_mentor.dto.response.TrackMentorResponse;
import com.example.swp.features.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/track-mentors")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ORGANIZER')")
public class TrackMentorController {

    private final TrackMentorService trackMentorService;

    @PostMapping
    public ResponseEntity<ApiResponse<TrackMentorResponse>> assignMentor(@Valid @RequestBody AssignMentorRequest request) {
        TrackMentorResponse response = trackMentorService.assignMentorToTrack(request.getTrackId(), request.getMentorId());
        return new ResponseEntity<>(ApiResponse.success(response, "Mentor assigned successfully."), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeMentor(@PathVariable Long id) {
        trackMentorService.removeMentorFromTrack(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Mentor removed from track successfully."));
    }

    @GetMapping("/track/{trackId}")
    @PreAuthorize("isAuthenticated()") // Allow authenticated users to see mentors
    public ResponseEntity<ApiResponse<List<UserResponse>>> getMentorsByTrack(@PathVariable Long trackId) {
        List<UserResponse> mentors = trackMentorService.getMentorsByTrack(trackId);
        return ResponseEntity.ok(ApiResponse.success(mentors));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<ApiResponse<List<TrackMentorResponse>>> getAssignmentsByMentor(@PathVariable Long mentorId) {
        List<TrackMentorResponse> assignments = trackMentorService.getAssignmentsByMentor(mentorId);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }
}
