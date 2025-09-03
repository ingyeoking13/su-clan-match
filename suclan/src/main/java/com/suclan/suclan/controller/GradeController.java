package com.suclan.suclan.controller;

import com.suclan.suclan.dto.GradeDto;
import com.suclan.suclan.service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    /**
     * 등급 생성
     */
    @PostMapping
    public ResponseEntity<GradeDto.Response> createGrade(@RequestBody GradeDto.CreateRequest request) {
        GradeDto.Response response = gradeService.createGrade(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 등급 목록 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<GradeDto.Summary>> getAllGrades(
            @PageableDefault Pageable pageable) {
        Page<GradeDto.Summary> grades = gradeService.getAllGrades(pageable);
        return ResponseEntity.ok(grades);
    }

    /**
     * 등급 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<GradeDto.Response> getGrade(@PathVariable Long id) {
        GradeDto.Response response = gradeService.getGrade(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 등급 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<GradeDto.Response> updateGrade(
            @PathVariable Long id,
            @RequestBody GradeDto.UpdateRequest request) {
        GradeDto.Response response = gradeService.updateGrade(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 등급 삭제 (소프트 삭제)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Boolean> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.ok(true);
    }
}
