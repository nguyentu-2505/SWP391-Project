package com.example.swp.features.recruitment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recruitment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecruitmentPostController {

    private final RecruitmentPostService postService;

    @PostMapping
    public ResponseEntity<com.example.swp.common.ApiResponse<RecruitmentPostResponse>> createPost(@Valid @RequestBody CreateRecruitmentPostRequest request) {
        RecruitmentPostResponse response = postService.createPost(request);
        return new ResponseEntity<>(com.example.swp.common.ApiResponse.success(response, "Post created successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<com.example.swp.common.ApiResponse<List<RecruitmentPostResponse>>> getPostsByEvent(@PathVariable Long eventId) {
        List<RecruitmentPostResponse> responses = postService.getPostsByEvent(eventId);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(responses));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<com.example.swp.common.ApiResponse<Void>> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok(com.example.swp.common.ApiResponse.success(null, "Post deleted successfully"));
    }
}
