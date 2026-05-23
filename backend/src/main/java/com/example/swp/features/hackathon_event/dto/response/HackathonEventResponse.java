package com.example.swp.features.hackathon_event.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class HackathonEventResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String imageUrl;
    private String status;
    private Long organizerId;
    private String organizerName;

    public static HackathonEventResponseBuilder builder() { return new HackathonEventResponseBuilder(); }
    public static class HackathonEventResponseBuilder {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String imageUrl;
        private String status;
        private Long organizerId;
        private String organizerName;

        public HackathonEventResponseBuilder id(Long id) { this.id = id; return this; }
        public HackathonEventResponseBuilder name(String name) { this.name = name; return this; }
        public HackathonEventResponseBuilder slug(String slug) { this.slug = slug; return this; }
        public HackathonEventResponseBuilder description(String description) { this.description = description; return this; }
        public HackathonEventResponseBuilder startTime(LocalDateTime startTime) { this.startTime = startTime; return this; }
        public HackathonEventResponseBuilder endTime(LocalDateTime endTime) { this.endTime = endTime; return this; }
        public HackathonEventResponseBuilder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public HackathonEventResponseBuilder status(String status) { this.status = status; return this; }
        public HackathonEventResponseBuilder organizerId(Long organizerId) { this.organizerId = organizerId; return this; }
        public HackathonEventResponseBuilder organizerName(String organizerName) { this.organizerName = organizerName; return this; }
        
        public HackathonEventResponse build() {
            HackathonEventResponse r = new HackathonEventResponse();
            r.id = this.id; r.name = this.name; r.slug = this.slug;
            r.description = this.description; r.startTime = this.startTime;
            r.endTime = this.endTime; r.imageUrl = this.imageUrl;
            r.status = this.status; r.organizerId = this.organizerId;
            r.organizerName = this.organizerName;
            return r;
        }
    }
}


