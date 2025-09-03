package com.suclan.suclan.dto;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.constant.Race;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class PlayerDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private String nickname;
        private Race race;
        private Long gradeId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String nickname;
        private Long gradeId;
        private Race race;
        private EntityStatus status;
        private String clanName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String nickname;
        private GradeDto.Summary grade;
        private ClanDto.Summary clan;
        private EntityStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private int totalMatches;
        private int wins;
        private int losses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private String nickname;
        private GradeDto.Summary grade;
        private ClanDto.Summary clan;
        private int totalMatches;
        private int wins;
        private int losses;
        private Race race;
        private LocalDateTime createdAt;
        private EntityStatus status;
    }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SearchCondition {
    private String nickname;
    private String grade;
  }

}
