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
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Hackathon event not found"));

        validateRoundTimeline(request.getStartTime(), request.getEndTime(), hackathonEvent, null, request.getAdvancementSlots());

        List<Round> existing = roundRepository.findByHackathonEventId(hackathonEvent.getId());
        int nextOrder = existing.size() + 1;

        Round newRound = Round.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .hackathonEvent(hackathonEvent)
                .roundOrder(nextOrder)
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
            throw new IllegalStateException("Cannot delete round: Only events in DRAFT status can have their rounds deleted.");
        }

        roundRepository.delete(round);

        // Re-order remaining rounds
        List<Round> remaining = roundRepository.findByHackathonEventId(event.getId()).stream()
                .filter(r -> !r.getId().equals(id))
                .sorted(java.util.Comparator.comparing(Round::getStartTime))
                .collect(Collectors.toList());
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setRoundOrder(i + 1);
            roundRepository.save(remaining.get(i));
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RoundResponse updateRound(Long id, com.example.swp.features.round.dto.request.CreateRoundRequest request) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new com.example.swp.exception.ResourceNotFoundException("Round not found: " + id));

        HackathonEvent hackathonEvent = round.getHackathonEvent();

        // Check if event status is DRAFT
        if (hackathonEvent.getStatus() != com.example.swp.features.hackathon_event.HackathonStatus.DRAFT) {
            throw new IllegalStateException("Cannot edit round: Only events in DRAFT status can have their rounds modified.");
        }

        validateRoundTimeline(request.getStartTime(), request.getEndTime(), hackathonEvent, id, request.getAdvancementSlots());

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

    private void validateRoundTimeline(java.time.LocalDateTime start, java.time.LocalDateTime end, HackathonEvent event, Long currentRoundId, Integer newAdvancementSlots) {
        if (start.isAfter(end) || start.isEqual(end)) {
            throw new IllegalArgumentException("Round start time must be before end time.");
        }
        if (start.isBefore(event.getStartTime())) {
            throw new IllegalArgumentException("Round start time cannot be before event start time (" + event.getStartTime() + ").");
        }
        if (end.isAfter(event.getEndTime())) {
            throw new IllegalArgumentException("Round end time cannot be after event end time (" + event.getEndTime() + ").");
        }
        if (event.getRegistrationEnd() != null && start.isBefore(event.getRegistrationEnd())) {
            throw new IllegalArgumentException("Round start time must be after event registration end time (" + event.getRegistrationEnd() + ").");
        }

        List<Round> allRounds = new java.util.ArrayList<>(roundRepository.findByHackathonEventId(event.getId()));
        if (currentRoundId == null) {
            Round temp = Round.builder()
                    .name("New Round")
                    .startTime(start)
                    .endTime(end)
                    .advancementSlots(newAdvancementSlots != null && newAdvancementSlots > 0 ? newAdvancementSlots : 2)
                    .build();
            allRounds.add(temp);
        } else {
            for (int i = 0; i < allRounds.size(); i++) {
                if (allRounds.get(i).getId().equals(currentRoundId)) {
                    allRounds.get(i).setStartTime(start);
                    allRounds.get(i).setEndTime(end);
                    if (newAdvancementSlots != null && newAdvancementSlots > 0) {
                        allRounds.get(i).setAdvancementSlots(newAdvancementSlots);
                    }
                }
            }
        }

        // Sort chronologically
        allRounds.sort(java.util.Comparator.comparing(Round::getStartTime));

        // Check overlaps and sequential slots
        for (int i = 0; i < allRounds.size(); i++) {
            Round current = allRounds.get(i);
            if (i < allRounds.size() - 1) {
                Round next = allRounds.get(i + 1);
                if (current.getEndTime().isAfter(next.getStartTime())) {
                    throw new IllegalArgumentException("Round times overlap: '" + current.getName() + "' ends at " + current.getEndTime() + 
                            ", but next round starts at " + next.getStartTime() + ".");
                }
                if (current.getAdvancementSlots() != null && next.getAdvancementSlots() != null) {
                    if (next.getAdvancementSlots() > current.getAdvancementSlots()) {
                        throw new IllegalArgumentException("Advancement slots of subsequent rounds must be less than or equal to the previous round. Round '" + 
                                current.getName() + "' has " + current.getAdvancementSlots() + " slots, but next round has " + next.getAdvancementSlots() + " slots.");
                    }
                }
            }
        }
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
