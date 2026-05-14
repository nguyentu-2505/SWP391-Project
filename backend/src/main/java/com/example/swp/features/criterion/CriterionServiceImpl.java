package com.example.swp.features.criterion;

import com.example.swp.features.hackathon_event.HackathonEvent;
import com.example.swp.features.hackathon_event.HackathonEventRepository;
import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CriterionServiceImpl implements CriterionService {

    private final CriterionRepository criterionRepository;
    private final HackathonEventRepository hackathonEventRepository;

    @Override
    public CriterionResponse createCriterion(CreateCriterionRequest request) {
        HackathonEvent hackathonEvent = null;
        if (request.getHackathonEventId() != null) {
            hackathonEvent = hackathonEventRepository.findById(request.getHackathonEventId())
                    .orElseThrow(() -> new RuntimeException("Hackathon event not found"));
        }

        Criterion newCriterion = Criterion.builder()
                .name(request.getName())
                .description(request.getDescription())
                .weight(request.getWeight())
                .hackathonEvent(hackathonEvent) // This can be null
                .build();

        Criterion savedCriterion = criterionRepository.save(newCriterion);
        return mapToResponse(savedCriterion);
    }

    @Override
    public List<CriterionResponse> getCriteriaForEvent(Long hackathonEventId) {
        return criterionRepository.findAllByHackathonEventIdOrDefault(hackathonEventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CriterionResponse> getDefaultCriteria() {
        return criterionRepository.findByHackathonEventIsNull().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CriterionResponse mapToResponse(Criterion criterion) {
        return CriterionResponse.builder()
                .id(criterion.getId())
                .name(criterion.getName())
                .description(criterion.getDescription())
                .weight(criterion.getWeight())
                .hackathonEventId(criterion.getHackathonEvent() != null ? criterion.getHackathonEvent().getId() : null)
                .isDefault(criterion.getHackathonEvent() == null)
                .build();
    }
}
