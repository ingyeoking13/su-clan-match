package com.suclan.suclan.dto;

import com.suclan.suclan.constant.EntityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ClanDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String name;
        private String description;
        private LocalDate foundingDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String name;
        private String description;
        private LocalDate closingDate;
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
        private LocalDate foundingDate;
        private LocalDate closingDate;
        private EntityStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int memberCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String name;
        private EntityStatus status;
        private LocalDate foundingDate;
        private int memberCount;
    }
}
