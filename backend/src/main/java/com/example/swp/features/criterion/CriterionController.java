package com.example.swp.features.criterion;

import com.example.swp.features.criterion.dto.request.CreateCriterionRequest;
import com.example.swp.features.criterion.dto.response.CriterionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/criteria")
@RequiredArgsConstructor
public class CriterionController {

    private final CriterionService criterionService;

    @PostMapping
    public ResponseEntity<CriterionResponse> createCriterion(@RequestBody CreateCriterionRequest request) {
        CriterionResponse response = criterionService.createCriterion(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/event/{hackathonEventId}")
    public ResponseEntity<List<CriterionResponse>> getCriteriaForEvent(@PathVariable Long hackathonEventId) {
        List<CriterionResponse> responses = criterionService.getCriteriaForEvent(hackathonEventId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/default")
    public ResponseEntity<List<CriterionResponse>> getDefaultCriteria() {
        List<CriterionResponse> responses = criterionService.getDefaultCriteria();
        return ResponseEntity.ok(responses);
    }
}
