package com.suclan.suclan.dto;

import com.suclan.suclan.constant.NoticeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NoticeDto {

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Summary {
    private Long id;
    private String title;
    private String writer;
    private NoticeType noticeType;
    private LocalDateTime createdAt;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Detail {
    private Long id;
    private String title;
    private String writer;
    private String text;
    private NoticeType noticeType;
    private LocalDateTime createdAt;
  }


  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CreateRequest {
    private String title;
    private String writer;
    private NoticeType noticeType;
    private String text;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CreateResponse {
    Long id;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SearchCondition {
    private NoticeType noticeType;
  }



}
