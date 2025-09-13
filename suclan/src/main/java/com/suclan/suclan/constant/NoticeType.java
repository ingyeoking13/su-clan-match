package com.suclan.suclan.constant;

public enum NoticeType {
  SYSTEM("시스템 공지"),
  ADMIN("관리자 공지");

  private String description;

  NoticeType(String description) {
    this.description = description;
  }
}
