package com.example.swp.features.hackathon_event;

import com.example.swp.exception.ResourceNotFoundException;
import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.request.UpdateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import com.example.swp.features.user.User;
import com.example.swp.features.user.UserRepository;
import com.github.slugify.Slugify;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HackathonEventServiceImpl implements HackathonEventService {

    private final HackathonEventRepository hackathonEventRepository;
    private final UserRepository userRepository;
    private final Slugify slugify = Slugify.builder().build();

    @Override
    public HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request) {
        User organizer = getCurrentUser();
        HackathonEvent event = HackathonEvent.builder()
                .name(request.getName())
                .slug(slugify.slugify(request.getName()))
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .imageUrl(request.getImageUrl())
                .organizer(organizer)
                .status(HackathonStatus.DRAFT)
                .build();

        HackathonEvent savedEvent = hackathonEventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Override
    public Page<HackathonEventResponse> getAllHackathonEvents(Pageable pageable) {
        return hackathonEventRepository.findByIsDeletedFalseAndStatus(HackathonStatus.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public List<HackathonEventResponse> getMyHackathonEvents() {
        User organizer = getCurrentUser();
        return hackathonEventRepository.findByOrganizerIdAndIsDeletedFalseOrderByCreatedAtDesc(organizer.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HackathonEventResponse getHackathonEventBySlug(String slug) {
        HackathonEvent event = hackathonEventRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found with slug: " + slug));
        return mapToResponse(event);
    }

    @Override
    public HackathonEventResponse updateHackathonEvent(Long id, UpdateHackathonEventRequest request) {
        HackathonEvent event = hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));
        // TODO: Add security check to ensure only the organizer can edit

        event.setName(request.getName());
        event.setSlug(slugify.slugify(request.getName()));
        event.setDescription(request.getDescription());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setImageUrl(request.getImageUrl());

        HackathonEvent updatedEvent = hackathonEventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    public void deleteHackathonEvent(Long id) {
        HackathonEvent event = hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));
        // TODO: Add security check
        event.setDeleted(true);
        hackathonEventRepository.save(event);
    }

    @Override
    public HackathonEventResponse updateHackathonEventStatus(Long id, HackathonStatus newStatus) {
        HackathonEvent event = hackathonEventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon event not found"));
        // TODO: Add security check
        event.setStatus(newStatus);
        
        HackathonEvent updatedEvent = hackathonEventRepository.save(event);
        return mapToResponse(updatedEvent);
    }
    
    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private HackathonEventResponse mapToResponse(HackathonEvent event) {
        return HackathonEventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .slug(event.getSlug())
                .description(event.getDescription())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .imageUrl(event.getImageUrl())
                .status(event.getStatus().name())
                .organizerId(event.getOrganizer() != null ? event.getOrganizer().getId() : null)
                .organizerName(event.getOrganizer() != null ? event.getOrganizer().getUsername() : null)
                .build();
    }
}
