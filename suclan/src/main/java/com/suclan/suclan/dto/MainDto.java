package com.suclan.suclan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


public class MainDto {
  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Summary {
    public Long clanCount;
    public Long memberCount;
    public Long matchCount;
    public List<MatchDto.Summary> matches;
  }

}
