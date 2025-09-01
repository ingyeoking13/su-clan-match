package com.suclan.suclan.dto;

import com.suclan.suclan.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ContestDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String name;
        private String description;
        private LocalDateTime startedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String description;
        private LocalDateTime endedAt;
        private EntityStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private EntityStatus status;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int participantCount;
        private int matchCount;
        private List<PlayerDto.Summary> participants;
        private List<MatchDto.Summary> matches;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private EntityStatus status;
        private LocalDateTime startedAt;
        private LocalDateTime endedAt;
        private int participantCount;
    }
}
