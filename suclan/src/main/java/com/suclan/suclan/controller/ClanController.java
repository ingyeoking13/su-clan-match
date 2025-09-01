package com.suclan.suclan.controller;

import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.service.ClanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clans")
@RequiredArgsConstructor
public class ClanController {

    private final ClanService clanService;

    /**
     * 클랜 생성
     */
    @PostMapping
    public ResponseEntity<ClanDto.Response> createClan(@RequestBody ClanDto.CreateRequest request) {
        ClanDto.Response response = clanService.createClan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 클랜 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<ClanDto.Summary>> getAllClans(
            @PageableDefault Pageable pageable) {
        Page<ClanDto.Summary> clans = clanService.getAllClans(pageable);
        return ResponseEntity.ok(clans);
    }

    /**
     * 클랜 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ClanDto.Response> getClan(@PathVariable Long id) {
        ClanDto.Response response = clanService.getClan(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 클랜 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ClanDto.Response> updateClan(
            @PathVariable Long id,
            @RequestBody ClanDto.UpdateRequest request) {
        ClanDto.Response response = clanService.updateClan(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 클랜 삭제 (소프트 삭제)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteClan(@PathVariable Long id) {
        clanService.deleteClan(id);
        return ResponseEntity.ok(true);
    }
}
