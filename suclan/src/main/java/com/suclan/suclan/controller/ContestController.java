package com.suclan.suclan.controller;

import com.suclan.suclan.dto.ContestDto;
import com.suclan.suclan.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    /**
     * 대회 생성
     */
    @PostMapping
    public ResponseEntity<ContestDto.Response> createContest(@RequestBody ContestDto.CreateRequest request) {
        ContestDto.Response response = contestService.createContest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 대회 목록 조회 (페이징)
     * 주의: ContestRepository가 구현되지 않아 현재는 예외 발생
     */
    @GetMapping
    public ResponseEntity<Page<ContestDto.Summary>> getAllContests(
            @PageableDefault Pageable pageable) {
        Page<ContestDto.Summary> contests = contestService.getAllContests(pageable);
        return ResponseEntity.ok(contests);
    }

    /**
     * 대회 상세 조회
     * 주의: ContestRepository가 구현되지 않아 현재는 예외 발생
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContestDto.Response> getContest(@PathVariable Long id) {
        ContestDto.Response response = contestService.getContest(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 대회 정보 수정
     * 주의: ContestRepository가 구현되지 않아 현재는 예외 발생
     */
    @PutMapping("/{id}")
    public ResponseEntity<ContestDto.Response> updateContest(
            @PathVariable Long id,
            @RequestBody ContestDto.UpdateRequest request) {
        ContestDto.Response response = contestService.updateContest(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 대회 삭제 (소프트 삭제)
     * 주의: ContestRepository가 구현되지 않아 현재는 예외 발생
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContest(@PathVariable Long id) {
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }
}
