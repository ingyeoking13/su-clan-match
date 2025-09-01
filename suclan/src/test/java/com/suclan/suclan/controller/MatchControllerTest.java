package com.suclan.suclan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.service.MatchService;
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

@WebMvcTest(MatchController.class)
@ActiveProfiles("test")
@DisplayName("MatchController 테스트")
class MatchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoSpyBean
    private MatchService matchService;

    @Test
    @DisplayName("매치 생성 성공")
    void createMatch_Success() throws Exception {
        // Given
        MatchDto.CreateRequest request = MatchDto.CreateRequest.builder()
                .playerOneId(1L)
                .playerTwoId(2L)
                .winnerId(1L)
                .mapName("테스트맵")
                .description("테스트 매치")
                .build();

        PlayerDto.Summary playerOne = PlayerDto.Summary.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary playerTwo = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        MatchDto.Response response = MatchDto.Response.builder()
                .id(1L)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerOne)
                .loser(playerTwo)
                .mapName("테스트맵")
                .description("테스트 매치")
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(matchService.createMatch(any(MatchDto.CreateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/matches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.playerOne.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.playerTwo.nickname").value("플레이어2"))
                .andExpect(jsonPath("$.winner.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.mapName").value("테스트맵"))
                .andExpect(jsonPath("$.description").value("테스트 매치"));

        verify(matchService, times(1)).createMatch(any(MatchDto.CreateRequest.class));
    }

    @Test
    @DisplayName("매치 조회 성공")
    void getMatch_Success() throws Exception {
        // Given
        Long matchId = 1L;
        PlayerDto.Summary playerOne = PlayerDto.Summary.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary playerTwo = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        MatchDto.Response response = MatchDto.Response.builder()
                .id(matchId)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerOne)
                .loser(playerTwo)
                .mapName("테스트맵")
                .description("테스트 매치")
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(matchService.getMatch(matchId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/matches/{id}", matchId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(matchId))
                .andExpect(jsonPath("$.playerOne.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.playerTwo.nickname").value("플레이어2"))
                .andExpect(jsonPath("$.winner.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.mapName").value("테스트맵"));

        verify(matchService, times(1)).getMatch(matchId);
    }

    @Test
    @DisplayName("존재하지 않는 매치 조회 시 404 반환")
    void getMatch_NotFound() throws Exception {
        // Given
        Long matchId = 999L;
        when(matchService.getMatch(matchId)).thenThrow(new ResourceNotFoundException("Match not found with id: " + matchId));

        // When & Then
        mockMvc.perform(get("/api/matches/{id}", matchId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Match not found with id: " + matchId));

        verify(matchService, times(1)).getMatch(matchId);
    }

    @Test
    @DisplayName("매치 목록 조회 성공")
    void getAllMatches_Success() throws Exception {
        // Given
        PlayerDto.Summary playerOne = PlayerDto.Summary.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary playerTwo = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        MatchDto.Summary match1 = MatchDto.Summary.builder()
                .id(1L)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerOne)
                .mapName("맵1")
                .createdAt(LocalDateTime.now())
                .build();

        MatchDto.Summary match2 = MatchDto.Summary.builder()
                .id(2L)
                .playerOne(playerTwo)
                .playerTwo(playerOne)
                .winner(playerTwo)
                .mapName("맵2")
                .createdAt(LocalDateTime.now())
                .build();

        Page<MatchDto.Summary> matchPage = new PageImpl<>(
                Arrays.asList(match1, match2),
                PageRequest.of(0, 20),
                2
        );

        when(matchService.getAllMatches(any())).thenReturn(matchPage);

        // When & Then
        mockMvc.perform(get("/api/matches")
                        .param("page", "0")
                        .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].mapName").value("맵1"))
                .andExpect(jsonPath("$.content[1].mapName").value("맵2"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(matchService, times(1)).getAllMatches(any());
    }

    @Test
    @DisplayName("특정 플레이어의 매치 목록 조회 성공")
    void getMatchesByPlayer_Success() throws Exception {
        // Given
        Long playerId = 1L;
        PlayerDto.Summary player = PlayerDto.Summary.builder()
                .id(playerId)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary opponent = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("상대방")
                .status(EntityStatus.REGISTERED)
                .build();

        MatchDto.Summary match1 = MatchDto.Summary.builder()
                .id(1L)
                .playerOne(player)
                .playerTwo(opponent)
                .winner(player)
                .mapName("맵1")
                .createdAt(LocalDateTime.now())
                .build();

        Page<MatchDto.Summary> matchPage = new PageImpl<>(
                Arrays.asList(match1),
                PageRequest.of(0, 20),
                1
        );

        when(matchService.getMatchesByPlayer(eq(playerId), any())).thenReturn(matchPage);

        // When & Then
        mockMvc.perform(get("/api/matches/player/{playerId}", playerId)
                        .param("page", "0")
                        .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].winner.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(matchService, times(1)).getMatchesByPlayer(eq(playerId), any());
    }

    @Test
    @DisplayName("매치 업데이트 성공")
    void updateMatch_Success() throws Exception {
        // Given
        Long matchId = 1L;
        MatchDto.UpdateRequest request = MatchDto.UpdateRequest.builder()
                .winnerId(2L)
                .mapName("업데이트된맵")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .build();

        PlayerDto.Summary playerOne = PlayerDto.Summary.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        PlayerDto.Summary playerTwo = PlayerDto.Summary.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        MatchDto.Response response = MatchDto.Response.builder()
                .id(matchId)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerTwo)
                .loser(playerOne)
                .mapName("업데이트된맵")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(matchService.updateMatch(eq(matchId), any(MatchDto.UpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/matches/{id}", matchId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(matchId))
                .andExpect(jsonPath("$.winner.nickname").value("플레이어2"))
                .andExpect(jsonPath("$.loser.nickname").value("플레이어1"))
                .andExpect(jsonPath("$.mapName").value("업데이트된맵"))
                .andExpect(jsonPath("$.description").value("업데이트된 설명"))
                .andExpect(jsonPath("$.status").value("RUNNING"));

        verify(matchService, times(1)).updateMatch(eq(matchId), any(MatchDto.UpdateRequest.class));
    }

    @Test
    @DisplayName("매치 삭제 성공")
    void deleteMatch_Success() throws Exception {
        // Given
        Long matchId = 1L;
        doNothing().when(matchService).deleteMatch(matchId);

        // When & Then
        mockMvc.perform(delete("/api/matches/{id}", matchId))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(matchService, times(1)).deleteMatch(matchId);
    }

    @Test
    @DisplayName("존재하지 않는 매치 삭제 시 404 반환")
    void deleteMatch_NotFound() throws Exception {
        // Given
        Long matchId = 999L;
        doThrow(new ResourceNotFoundException("Match not found with id: " + matchId))
                .when(matchService).deleteMatch(matchId);

        // When & Then
        mockMvc.perform(delete("/api/matches/{id}", matchId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Match not found with id: " + matchId));

        verify(matchService, times(1)).deleteMatch(matchId);
    }
}
