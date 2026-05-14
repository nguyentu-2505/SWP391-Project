package com.example.swp.features.hackathon_event;

import com.example.swp.features.hackathon_event.dto.request.CreateHackathonEventRequest;
import com.example.swp.features.hackathon_event.dto.response.HackathonEventResponse;

import java.util.List;

public interface HackathonEventService {
    HackathonEventResponse createHackathonEvent(CreateHackathonEventRequest request);
    List<HackathonEventResponse> getAllHackathonEvents();
    HackathonEventResponse getHackathonEventBySlug(String slug);
}
