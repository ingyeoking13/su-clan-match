package com.suclan.suclan.controller;

import com.suclan.suclan.dto.GradeDto;
import com.suclan.suclan.dto.MainDto;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.service.GradeService;
import com.suclan.suclan.service.MainFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainController {

  private final MainFacade mainFacade;

  @GetMapping
  public ResponseEntity<MainDto.Summary> getMainSummary() {
    MainDto.Summary response = mainFacade.getSummary();
    return ResponseEntity.ok(response);
  }

}
