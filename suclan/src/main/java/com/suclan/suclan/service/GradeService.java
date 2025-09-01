package com.suclan.suclan.service;

import com.suclan.suclan.domain.Grade;
import com.suclan.suclan.dto.GradeDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradeService {

    private final GradeRepository gradeRepository;

    @Transactional
    public GradeDto.Response createGrade(GradeDto.CreateRequest request) {
        Grade grade = Grade.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        Grade savedGrade = gradeRepository.save(grade);
        return convertToResponse(savedGrade);
    }

    @Transactional
    public GradeDto.Response updateGrade(Long id, GradeDto.UpdateRequest request) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + id));

        if (request.getName() != null) {
            grade.setName(request.getName());
        }
        if (request.getDescription() != null) {
            grade.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            grade.setStatus(request.getStatus());
        }

        Grade updatedGrade = gradeRepository.save(grade);
        return convertToResponse(updatedGrade);
    }

    @Transactional
    public GradeDto.Response getGrade(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + id));
        return convertToResponse(grade);
    }

    @Transactional
    public Page<GradeDto.Summary> getAllGrades(Pageable pageable) {
        return gradeRepository.findAll(pageable)
                .map(this::convertToSummary);
    }

    @Transactional
    public void deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grade not found with id: " + id);
        }
        gradeRepository.deleteById(id);
    }

    private GradeDto.Response convertToResponse(Grade grade) {
        return GradeDto.Response.builder()
                .id(grade.getId())
                .name(grade.getName())
                .description(grade.getDescription())
                .status(grade.getStatus())
                .createdAt(grade.getCreatedAt())
                .updatedAt(grade.getUpdatedAt())
                .playerCount(grade.getPlayers().size())
                .build();
    }

    private GradeDto.Summary convertToSummary(Grade grade) {
        return GradeDto.Summary.builder()
                .id(grade.getId())
                .name(grade.getName())
                .status(grade.getStatus())
                .build();
    }
}
