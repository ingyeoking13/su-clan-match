package com.suclan.suclan.controller;

import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.dto.NoticeDto;
import com.suclan.suclan.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {
  private final NoticeService noticeService;


  @GetMapping
  public ResponseEntity<Page<NoticeDto.Summary>> getNotices(Pageable pageable, @ModelAttribute NoticeDto.SearchCondition searchCondition) {
    return ResponseEntity.ok(noticeService.getNotices(pageable, searchCondition));
  }

  @PostMapping
  public ResponseEntity<NoticeDto.CreateResponse> createNotice(@RequestBody NoticeDto.CreateRequest createRequest) {
    return ResponseEntity.ok(noticeService.createNotice(createRequest));
  }

  @GetMapping("/{noticeId}")
  public ResponseEntity<NoticeDto.Detail> getNotice(@PathVariable Long noticeId) {
    return ResponseEntity.ok(noticeService.getNoticeDetail(noticeId));
  }



}
