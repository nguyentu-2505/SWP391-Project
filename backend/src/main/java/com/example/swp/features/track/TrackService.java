package com.example.swp.features.track;

import com.example.swp.features.track.dto.request.CreateTrackRequest;
import com.example.swp.features.track.dto.response.TrackResponse;

import java.util.List;

public interface TrackService {
    TrackResponse createTrack(CreateTrackRequest request);
    List<TrackResponse> getTracksByHackathonEvent(Long hackathonEventId);
}
