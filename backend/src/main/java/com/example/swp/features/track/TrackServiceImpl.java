package com.example.swp.features.track;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackMentorResponse;
import com.example.swp.features.track.dto.response.TrackResponse;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackServiceImpl implements TrackService {

    private final TrackRepository trackRepository;
    private final HackathonEventRepository hackathonEventRepository;
    private final TrackMentorRepository trackMentorRepository;  // NEW
    private final UserRepository userRepository;                 // NEW
    private final AuditLogService auditLogService;               // NEW

    // ── Existing methods – UNCHANGED ──────────────────────────────────────────

    @Override
    public TrackResponse createTrack(CreateTrackRequest request) {
        HackathonEvent hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new RuntimeException("Hackathon event not found")); // Replace with custom exception

        Track newTrack = Track.builder()
                .name(request.getName())
                .description(request.getDescription())
                .hackathonEvent(hackathonEvent)
                .build();

        Track savedTrack = trackRepository.save(newTrack);
        return mapToResponse(savedTrack);
    }

    @Override
    public List<TrackResponse> getTracksByHackathonEvent(Long hackathonEventId) {
        return trackRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ── New methods – Track-Mentor assignment ─────────────────────────────────

    /**
     * Assigns a mentor (MENTOR or JUDGE role) to a track.
     * WHY: Organizer must officially assign mentors to tracks so the system
     * can enforce the conflict-of-interest rule (cannot judge a track you mentor).
     *
     * Validation:
     * - GUEST_JUDGE cannot be assigned as mentor (business rule)
     * - Only MENTOR or JUDGE roles are valid mentor candidates
     * - Duplicate assignment is rejected
     */
    @Override
    @Transactional
    public TrackMentorResponse assignMentor(Long trackId, Long mentorUserId) {
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found: " + trackId));

        User mentor = userRepository.findById(mentorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + mentorUserId));

        // Security: Guest Judge cannot be a mentor
        if (mentor.getRole() == Role.GUEST_JUDGE) {
            throw new AccessDeniedException("Guest judges cannot be assigned as track mentors.");
        }

        // Validation: only MENTOR or JUDGE (internal) roles can mentor tracks
        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.JUDGE) {
            throw new IllegalArgumentException(
                "Only users with MENTOR or JUDGE role can be assigned as track mentors. " +
                "User '" + mentor.getUsername() + "' has role: " + mentor.getRole()
            );
        }

        // Idempotency guard: prevent duplicate assignment
        if (trackMentorRepository.existsByTrackIdAndMentorId(trackId, mentorUserId)) {
            throw new IllegalStateException(
                "User '" + mentor.getUsername() + "' is already assigned as mentor for this track."
            );
        }

        User assigner = getCurrentUser();

        TrackMentor assignment = TrackMentor.builder()
                .track(track)
                .mentor(mentor)
                .event(track.getHackathonEvent())
                .assignedBy(assigner)
                .build();

        TrackMentor saved = trackMentorRepository.save(assignment);

        auditLogService.logAction(
            "ASSIGN_TRACK_MENTOR",
            "TRACK",
            trackId,
            null,
            "Assigned mentor " + mentor.getUsername()
        );

        return mapToMentorResponse(saved);
    }

    /**
     * Removes a mentor from a track.
     * Organizer can remove a mentor assignment (e.g., conflict resolution).
     */
    @Override
    @Transactional
    public void removeMentor(Long trackId, Long mentorUserId) {
        TrackMentor assignment = trackMentorRepository.findByTrackIdAndMentorId(trackId, mentorUserId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "No mentor assignment found for user " + mentorUserId + " on track " + trackId));
        trackMentorRepository.delete(assignment);

        auditLogService.logAction(
            "REMOVE_TRACK_MENTOR",
            "TRACK",
            trackId,
            "Mentor " + assignment.getMentor().getUsername(),
            null
        );
    }

    /**
     * Returns all mentors assigned to a specific track.
     * Used by Organizer UI to see current mentor roster.
     */
    @Override
    public List<TrackMentorResponse> getMentorsByTrack(Long trackId) {
        // Validate track exists
        if (!trackRepository.existsById(trackId)) {
            throw new ResourceNotFoundException("Track not found: " + trackId);
        }
        return trackMentorRepository.findByTrackId(trackId).stream()
                .map(this::mapToMentorResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private TrackResponse mapToResponse(Track track) {
        return TrackResponse.builder()
                .id(track.getId())
                .name(track.getName())
                .description(track.getDescription())
                .hackathonEventId(track.getHackathonEvent().getId())
                .build();
    }

    private TrackMentorResponse mapToMentorResponse(TrackMentor tm) {
        return TrackMentorResponse.builder()
                .id(tm.getId())
                .trackId(tm.getTrack().getId())
                .trackName(tm.getTrack().getName())
                .mentorId(tm.getMentor().getId())
                .mentorUsername(tm.getMentor().getUsername())
                .mentorFullName(tm.getMentor().getFullName())
                .mentorRole(tm.getMentor().getRole().name())
                .assignedById(tm.getAssignedBy() != null ? tm.getAssignedBy().getId() : null)
                .assignedAt(tm.getAssignedAt())
                .build();
    }
}

