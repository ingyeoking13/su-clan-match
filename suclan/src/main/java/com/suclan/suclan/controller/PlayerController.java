package com.suclan.suclan.controller;

import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.service.PlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.query.Param;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    /**
     * 플레이어 생성
     */
    @PostMapping
    public ResponseEntity<PlayerDto.Response> createPlayer(@RequestBody PlayerDto.CreateRequest request) {
        PlayerDto.Response response = playerService.createPlayer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 플레이어 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<PlayerDto.Summary>> getAllPlayers(
            @PageableDefault Pageable pageable,
            @RequestParam(required = false) boolean includeDeleted,
            PlayerDto.SearchCondition condition
        ) {
        Page<PlayerDto.Summary> players = playerService.getAllPlayers(pageable, includeDeleted, condition);
        return ResponseEntity.ok(players);
    }

    /**
     * 플레이어 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<PlayerDto.Response> getPlayer(@PathVariable Long id) {
        PlayerDto.Response response = playerService.getPlayer(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 플레이어 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<PlayerDto.Response> updatePlayer(
            @PathVariable Long id,
            @RequestBody PlayerDto.UpdateRequest request) {
        PlayerDto.Response response = playerService.updatePlayer(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 플레이어 삭제 (소프트 삭제)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlayer(@PathVariable Long id) {
        playerService.deletePlayer(id);
        return ResponseEntity.noContent().build();
    }
}
