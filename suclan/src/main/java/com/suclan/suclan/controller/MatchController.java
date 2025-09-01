package com.suclan.suclan.controller;

import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    /**
     * 매치 생성
     */
    @PostMapping
    public ResponseEntity<MatchDto.Response> createMatch(@RequestBody MatchDto.CreateRequest request) {
        MatchDto.Response response = matchService.createMatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 매치 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<MatchDto.Summary>> getAllMatches(
            @PageableDefault Pageable pageable) {
        Page<MatchDto.Summary> matches = matchService.getAllMatches(pageable);
        return ResponseEntity.ok(matches);
    }

    /**
     * 특정 플레이어의 매치 목록 조회
     */
    @GetMapping("/player/{playerId}")
    public ResponseEntity<Page<MatchDto.Summary>> getMatchesByPlayer(
            @PathVariable Long playerId,
            @PageableDefault Pageable pageable) {
        Page<MatchDto.Summary> matches = matchService.getMatchesByPlayer(playerId, pageable);
        return ResponseEntity.ok(matches);
    }

    /**
     * 매치 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<MatchDto.Response> getMatch(@PathVariable Long id) {
        MatchDto.Response response = matchService.getMatch(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 매치 정보 수정 (주로 결과 업데이트)
     */
    @PutMapping("/{id}")
    public ResponseEntity<MatchDto.Response> updateMatch(
            @PathVariable Long id,
            @RequestBody MatchDto.UpdateRequest request) {
        MatchDto.Response response = matchService.updateMatch(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 매치 삭제 (소프트 삭제)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable Long id) {
        matchService.deleteMatch(id);
        return ResponseEntity.noContent().build();
    }
}
