package com.example.swp.features.track_mentor;

import com.example.swp.exception.BadRequestException;
import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.audit_log.AuditLogService;
import com.example.swp.features.track.Track;
import com.example.swp.features.track.TrackMentor;
import com.example.swp.features.track.TrackRepository;
import com.example.swp.features.track_mentor.dto.response.TrackMentorResponse;
import com.example.swp.features.user.Role;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.example.swp.features.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackMentorServiceImpl implements TrackMentorService {

    private final TrackMentorRepository trackMentorRepository;
    private final TrackRepository trackRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public TrackMentorResponse assignMentorToTrack(Long trackId, Long mentorId) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User assigner = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new ResourceNotFoundException("Track not found with id: " + trackId));

        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + mentorId));

        if (mentor.getRole() != Role.MENTOR && mentor.getRole() != Role.JUDGE) {
            throw new BadRequestException("User is not a Mentor or Judge.");
        }

        if (trackMentorRepository.findByTrackIdAndMentorId(trackId, mentorId).isPresent()) {
            throw new BadRequestException("This user is already assigned to this track.");
        }

        TrackMentor assignment = TrackMentor.builder()
                .track(track)
                .mentor(mentor)
                .event(track.getHackathonEvent())
                .assignedBy(assigner)
                .build();

        TrackMentor savedAssignment = trackMentorRepository.save(assignment);

        auditLogService.logAction(
                "ASSIGN_MENTOR",
                "TRACK_MENTOR",
                savedAssignment.getId(),
                null,
                String.format("Assigned %s %s to track %s", mentor.getRole(), mentor.getUsername(), track.getName())
        );

        return mapToResponse(savedAssignment);
    }

    @Override
    @Transactional
    public void removeMentorFromTrack(Long trackMentorId) {
        TrackMentor assignment = trackMentorRepository.findById(trackMentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Track-Mentor assignment not found with id: " + trackMentorId));

        trackMentorRepository.delete(assignment);

        auditLogService.logAction(
                "REMOVE_MENTOR",
                "TRACK_MENTOR",
                trackMentorId,
                String.format("Removed %s %s from track %s", assignment.getMentor().getRole(), assignment.getMentor().getUsername(), assignment.getTrack().getName()),
                null
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getMentorsByTrack(Long trackId) {
        List<TrackMentor> assignments = trackMentorRepository.findByTrackId(trackId);
        return assignments.stream()
                .map(assignment -> mapToUserResponse(assignment.getMentor()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TrackMentorResponse> getAssignmentsByMentor(Long mentorId) {
        List<TrackMentor> assignments = trackMentorRepository.findByMentorId(mentorId);
        return assignments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TrackMentorResponse mapToResponse(TrackMentor assignment) {
        return TrackMentorResponse.builder()
                .id(assignment.getId())
                .trackId(assignment.getTrack().getId())
                .trackName(assignment.getTrack().getName())
                .mentorId(assignment.getMentor().getId())
                .mentorName(assignment.getMentor().getUsername())
                .eventId(assignment.getEvent().getId())
                .eventName(assignment.getEvent().getName())
                .assignedById(assignment.getAssignedBy() != null ? assignment.getAssignedBy().getId() : null)
                .assignedByName(assignment.getAssignedBy() != null ? assignment.getAssignedBy().getUsername() : null)
                .assignedAt(assignment.getAssignedAt())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
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
