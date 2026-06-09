package com.example.swp.features.mentorship_request;

import com.example.swp.common.ApiResponse;
import com.example.swp.features.mentorship_request.dto.request.CreateMentorshipRequest;
import com.example.swp.features.mentorship_request.dto.response.MentorshipRequestResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mentorship-requests")
@RequiredArgsConstructor
public class MentorshipRequestController {

    private final MentorshipRequestService requestService;

    @PostMapping
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<ApiResponse<MentorshipRequestResponse>> createRequest(@Valid @RequestBody CreateMentorshipRequest request) {
        MentorshipRequestResponse response = requestService.createRequest(request);
        return new ResponseEntity<>(ApiResponse.success(response, "Mentorship request created."), HttpStatus.CREATED);
    }

    @GetMapping("/open")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ApiResponse<List<MentorshipRequestResponse>>> getOpenRequests() {
        List<MentorshipRequestResponse> responses = requestService.getOpenRequests();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
    
    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('MENTOR', 'PARTICIPANT')")
    public ResponseEntity<ApiResponse<List<MentorshipRequestResponse>>> getMyRequests() {
        List<MentorshipRequestResponse> responses = requestService.getMyMentorshipRequests();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ApiResponse<MentorshipRequestResponse>> acceptRequest(@PathVariable Long id) {
        MentorshipRequestResponse response = requestService.acceptRequest(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Request accepted."));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('MENTOR', 'PARTICIPANT')")
    public ResponseEntity<ApiResponse<MentorshipRequestResponse>> resolveRequest(@PathVariable Long id) {
        MentorshipRequestResponse response = requestService.resolveRequest(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Request marked as resolved."));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<ApiResponse<MentorshipRequestResponse>> rejectRequest(@PathVariable Long id) {
        MentorshipRequestResponse response = requestService.rejectRequest(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Request rejected and is open again."));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PARTICIPANT', 'ADMIN', 'ORGANIZER')")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(@PathVariable Long id) {
        requestService.cancelRequest(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Mentorship request cancelled successfully."));
    }
}
