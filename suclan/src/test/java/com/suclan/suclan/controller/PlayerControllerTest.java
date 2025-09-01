package com.suclan.suclan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.dto.GradeDto;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.service.PlayerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PlayerController.class)
@ActiveProfiles("test")
@DisplayName("PlayerController 테스트")
class PlayerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoSpyBean
    private PlayerService playerService;

    @Test
    @DisplayName("플레이어 생성 성공")
    void createPlayer_Success() throws Exception {
        // Given
        PlayerDto.CreateRequest request = PlayerDto.CreateRequest.builder()
                .nickname("테스트플레이어")
                .gradeId(1L)
                .build();

        GradeDto.Summary gradeDto = GradeDto.Summary.builder()
                .id(1L)
                .name("브론즈")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Response response = PlayerDto.Response.builder()
                .id(1L)
                .nickname("테스트플레이어")
                .grade(gradeDto)
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .totalMatches(0)
                .wins(0)
                .losses(0)
                .build();

        when(playerService.createPlayer(any(PlayerDto.CreateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/players")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nickname").value("테스트플레이어"))
                .andExpect(jsonPath("$.grade.name").value("브론즈"))
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.totalMatches").value(0));

        verify(playerService, times(1)).createPlayer(any(PlayerDto.CreateRequest.class));
    }

    @Test
    @DisplayName("플레이어 조회 성공")
    void getPlayer_Success() throws Exception {
        // Given
        Long playerId = 1L;
        GradeDto.Summary gradeDto = GradeDto.Summary.builder()
                .id(1L)
                .name("브론즈")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Response response = PlayerDto.Response.builder()
                .id(playerId)
                .nickname("테스트플레이어")
                .grade(gradeDto)
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .totalMatches(10)
                .wins(7)
                .losses(3)
                .build();

        when(playerService.getPlayer(playerId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/players/{id}", playerId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(playerId))
                .andExpect(jsonPath("$.nickname").value("테스트플레이어"))
                .andExpect(jsonPath("$.grade.name").value("브론즈"))
                .andExpect(jsonPath("$.totalMatches").value(10))
                .andExpect(jsonPath("$.wins").value(7))
                .andExpect(jsonPath("$.losses").value(3));

        verify(playerService, times(1)).getPlayer(playerId);
    }

    @Test
    @DisplayName("존재하지 않는 플레이어 조회 시 404 반환")
    void getPlayer_NotFound() throws Exception {
        // Given
        Long playerId = 999L;
        when(playerService.getPlayer(playerId)).thenThrow(new ResourceNotFoundException("Player not found with id: " + playerId));

        // When & Then
        mockMvc.perform(get("/api/players/{id}", playerId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Player not found with id: " + playerId));

        verify(playerService, times(1)).getPlayer(playerId);
    }

    @Test
    @DisplayName("플레이어 목록 조회 성공")
    void getAllPlayers_Success() throws Exception {
        // Given
        GradeDto.Summary gradeDto = GradeDto.Summary.builder()
                .id(1L)
                .name("브론즈")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary player1 = PlayerDto.Summary.builder()
                .id(1L)
                .nickname("플레이어1")
                .grade(gradeDto)
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary player2 = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("플레이어2")
                .grade(gradeDto)
                .status(EntityStatus.REGISTERED)
                .build();

        Page<PlayerDto.Summary> playerPage = new PageImpl<>(
                Arrays.asList(player1, player2),
                PageRequest.of(0, 20),
                2
        );

        when(playerService.getAllPlayers(any())).thenReturn(playerPage);

        // When & Then
        mockMvc.perform(get("/api/players")
                        .param("page", "0")
                        .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].nickname").value("플레이어1"))
                .andExpect(jsonPath("$.content[1].nickname").value("플레이어2"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(playerService, times(1)).getAllPlayers(any());
    }

    @Test
    @DisplayName("플레이어 업데이트 성공")
    void updatePlayer_Success() throws Exception {
        // Given
        Long playerId = 1L;
        PlayerDto.UpdateRequest request = PlayerDto.UpdateRequest.builder()
                .nickname("업데이트된플레이어")
                .gradeId(2L)
                .status(EntityStatus.RUNNING)
                .build();

        GradeDto.Summary newGradeDto = GradeDto.Summary.builder()
                .id(2L)
                .name("실버")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Response response = PlayerDto.Response.builder()
                .id(playerId)
                .nickname("업데이트된플레이어")
                .grade(newGradeDto)
                .status(EntityStatus.RUNNING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .totalMatches(10)
                .wins(7)
                .losses(3)
                .build();

        when(playerService.updatePlayer(eq(playerId), any(PlayerDto.UpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/players/{id}", playerId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(playerId))
                .andExpect(jsonPath("$.nickname").value("업데이트된플레이어"))
                .andExpect(jsonPath("$.grade.name").value("실버"))
                .andExpect(jsonPath("$.status").value("RUNNING"));

        verify(playerService, times(1)).updatePlayer(eq(playerId), any(PlayerDto.UpdateRequest.class));
    }

    @Test
    @DisplayName("플레이어 삭제 성공")
    void deletePlayer_Success() throws Exception {
        // Given
        Long playerId = 1L;
        doNothing().when(playerService).deletePlayer(playerId);

        // When & Then
        mockMvc.perform(delete("/api/players/{id}", playerId))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(playerService, times(1)).deletePlayer(playerId);
    }

    @Test
    @DisplayName("존재하지 않는 플레이어 삭제 시 404 반환")
    void deletePlayer_NotFound() throws Exception {
        // Given
        Long playerId = 999L;
        doThrow(new ResourceNotFoundException("Player not found with id: " + playerId))
                .when(playerService).deletePlayer(playerId);

        // When & Then
        mockMvc.perform(delete("/api/players/{id}", playerId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Player not found with id: " + playerId));

        verify(playerService, times(1)).deletePlayer(playerId);
    }
}
