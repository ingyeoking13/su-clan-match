package com.suclan.suclan.dto;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.constant.Race;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class MatchDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long playerOneId;
        private Long playerTwoId;
        private Race playerOneRace;
        private Race playerTwoRace;
        private Long winnerId;
        private String mapName;
        private String description;
        private String streamingUrl;
        private LocalDateTime matchTime;
        private Long contestId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private Long winnerId;
        private String mapName;
        private String description;
        private Long playerOneId;
        private Long playerTwoId;
        private Race playerOneRace;
        private Race playerTwoRace;
        private String streamingUrl;
        private LocalDateTime matchTime;
        private EntityStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private PlayerDto.Summary playerOne;
        private PlayerDto.Summary playerTwo;
        private PlayerDto.Summary winner;
        private PlayerDto.Summary loser;
        private String mapName;
        private String description;
        private ContestDto.Summary contest;
        private EntityStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Summary {
        private Long id;
        private PlayerDto.Summary playerOne;
        private PlayerDto.Summary playerTwo;
        private Race playerOneRace;
        private Race playerTwoRace;
        private PlayerDto.Summary winner;
        private String mapName;
        private LocalDateTime createdAt;
    }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SearchCondition {
    private String playerOneNickname;
    private String playerTwoNickname;
    private String mapName;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    private boolean includeDeleted;
  }
}
