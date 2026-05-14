package com.example.swp.features.hackathon_event;

import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;
import com.example.swp.util.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HackathonEventServiceImpl implements HackathonEventService {

    private final HackathonEventRepository hackathonEventRepository;

    @Override
    public HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request) {
        HackathonEvent newEvent = HackathonEvent.builder()
                .name(request.getName())
                .slug(SlugUtil.createSlug(request.getName()))
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .imageUrl(request.getImageUrl())
                .build();

        HackathonEvent savedEvent = hackathonEventRepository.save(newEvent);
        return mapToResponse(savedEvent);
    }

    @Override
    public List<HackathonEventResponse> getAllHackathonEvents() {
        return hackathonEventRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HackathonEventResponse getHackathonEventBySlug(String slug) {
        return hackathonEventRepository.findBySlug(slug)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Hackathon event not found with slug: " + slug)); // Replace with custom exception
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
                .build();
    }
}
