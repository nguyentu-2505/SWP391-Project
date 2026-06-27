package com.example.swp.features.round;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.round.dto.request.CreateRoundRequest;
import com.example.swp.features.round.dto.response.RoundResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class RoundServiceImpl implements RoundService {

    private final RoundRepository roundRepository;
    private final HackathonEventRepository hackathonEventRepository;

    @Override
    public RoundResponse createRound(CreateRoundRequest request) {
        HackathonEvent hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                .orElseThrow(() -> new RuntimeException("Hackathon event not found")); // Replace with custom exception

        // Validation 1: Round start time must be before end time
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu của vòng thi phải trước thời gian kết thúc.");
        }

        // Validation 2: Round start time must be within event duration
        if (request.getStartTime().isBefore(hackathonEvent.getStartTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu của vòng thi không được trước thời gian bắt đầu của sự kiện (" + hackathonEvent.getStartTime() + ").");
        }

        // Validation 3: Round end time must be within event duration
        if (request.getEndTime().isAfter(hackathonEvent.getEndTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc của vòng thi không được sau thời gian kết thúc của sự kiện (" + hackathonEvent.getEndTime() + ").");
        }

        Round newRound = Round.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .hackathonEvent(hackathonEvent)
                .advancementSlots(request.getAdvancementSlots() != null && request.getAdvancementSlots() > 0 ? request.getAdvancementSlots() : 2)
                .build();

        Round savedRound = roundRepository.save(newRound);
        return mapToResponse(savedRound);
    }

    @Override
    public List<RoundResponse> getRoundsByHackathonEvent(Long hackathonEventId) {
        return roundRepository.findByHackathonEventId(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteRound(Long id) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        HackathonEvent event = round.getHackathonEvent();

        // Check if event status is DRAFT
        if (event.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Không thể xóa vòng thi: Chỉ sự kiện ở trạng thái DRAFT mới được phép xóa vòng thi.");
        }

        roundRepository.delete(round);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RoundResponse updateRound(Long id, com.example.swp.features.round.dto.request.CreateRoundRequest request) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        HackathonEvent hackathonEvent = round.getHackathonEvent();

        // Check if event status is DRAFT
        if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Không thể chỉnh sửa vòng thi: Chỉ sự kiện ở trạng thái DRAFT mới được phép chỉnh sửa vòng thi.");
        }

        // Validation 1: Round start time must be before end time
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu của vòng thi phải trước thời gian kết thúc.");
        }

        // Validation 2: Round start time must be within event duration
        if (request.getStartTime().isBefore(hackathonEvent.getStartTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu của vòng thi không được trước thời gian bắt đầu của sự kiện (" + hackathonEvent.getStartTime() + ").");
        }

        // Validation 3: Round end time must be within event duration
        if (request.getEndTime().isAfter(hackathonEvent.getEndTime())) {
            throw new IllegalArgumentException("Thời gian kết thúc của vòng thi không được sau thời gian kết thúc của sự kiện (" + hackathonEvent.getEndTime() + ").");
        }

        round.setName(request.getName());
        round.setDescription(request.getDescription());
        round.setStartTime(request.getStartTime());
        round.setEndTime(request.getEndTime());
        if (request.getAdvancementSlots() != null && request.getAdvancementSlots() > 0) {
            round.setAdvancementSlots(request.getAdvancementSlots());
        }

        Round updatedRound = roundRepository.save(round);
        return mapToResponse(updatedRound);
    }

    private RoundResponse mapToResponse(Round round) {
        return RoundResponse.builder()
                .id(round.getId())
                .name(round.getName())
                .description(round.getDescription())
                .startTime(round.getStartTime())
                .endTime(round.getEndTime())
                .hackathonEventId(round.getHackathonEvent().getId())
                .advancementSlots(round.getAdvancementSlots())
                .build();
    }
}
