package com.suclan.suclan.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.service.ClanService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ClanController.class)
@ActiveProfiles("test")
@DisplayName("ClanController 테스트")
class ClanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoSpyBean
    private ClanService clanService;

    @Test
    @DisplayName("클랜 생성 성공")
    void createClan_Success() throws Exception {
        // Given
        ClanDto.CreateRequest request = ClanDto.CreateRequest.builder()
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .build();

        ClanDto.Response response = ClanDto.Response.builder()
                .id(1L)
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .memberCount(0)
                .build();

        when(clanService.createClan(any(ClanDto.CreateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/clans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("테스트 클랜"))
                .andExpect(jsonPath("$.description").value("테스트 클랜입니다"))
                .andExpect(jsonPath("$.status").value("REGISTERED"))
                .andExpect(jsonPath("$.memberCount").value(0));

        verify(clanService, times(1)).createClan(any(ClanDto.CreateRequest.class));
    }

    @Test
    @DisplayName("클랜 조회 성공")
    void getClan_Success() throws Exception {
        // Given
        Long clanId = 1L;
        ClanDto.Response response = ClanDto.Response.builder()
                .id(clanId)
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .status(EntityStatus.REGISTERED)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .memberCount(5)
                .build();

        when(clanService.getClan(clanId)).thenReturn(response);

        // When & Then
        mockMvc.perform(get("/api/clans/{id}", clanId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clanId))
                .andExpect(jsonPath("$.name").value("테스트 클랜"))
                .andExpect(jsonPath("$.memberCount").value(5));

        verify(clanService, times(1)).getClan(clanId);
    }

    @Test
    @DisplayName("존재하지 않는 클랜 조회 시 404 반환")
    void getClan_NotFound() throws Exception {
        // Given
        Long clanId = 999L;
        when(clanService.getClan(clanId)).thenThrow(new ResourceNotFoundException("Clan not found with id: " + clanId));

        // When & Then
        mockMvc.perform(get("/api/clans/{id}", clanId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Clan not found with id: " + clanId));

        verify(clanService, times(1)).getClan(clanId);
    }

    @Test
    @DisplayName("클랜 목록 조회 성공")
    void getAllClans_Success() throws Exception {
        // Given
        ClanDto.Summary clan1 = ClanDto.Summary.builder()
                .id(1L)
                .name("클랜1")
                .status(EntityStatus.REGISTERED)
                .memberCount(5)
                .build();

        ClanDto.Summary clan2 = ClanDto.Summary.builder()
                .id(2L)
                .name("클랜2")
                .status(EntityStatus.REGISTERED)
                .memberCount(3)
                .build();

        Page<ClanDto.Summary> clanPage = new PageImpl<>(
                Arrays.asList(clan1, clan2),
                PageRequest.of(0, 20),
                2
        );

        when(clanService.getAllClans(any())).thenReturn(clanPage);

        // When & Then
        mockMvc.perform(get("/api/clans")
                        .param("page", "0")
                        .param("size", "20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value("클랜1"))
                .andExpect(jsonPath("$.content[1].name").value("클랜2"))
                .andExpect(jsonPath("$.totalElements").value(2));

        verify(clanService, times(1)).getAllClans(any());
    }

    @Test
    @DisplayName("클랜 업데이트 성공")
    void updateClan_Success() throws Exception {
        // Given
        Long clanId = 1L;
        ClanDto.UpdateRequest request = ClanDto.UpdateRequest.builder()
                .name("업데이트된 클랜")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .build();

        ClanDto.Response response = ClanDto.Response.builder()
                .id(clanId)
                .name("업데이트된 클랜")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .foundingDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .memberCount(5)
                .build();

        when(clanService.updateClan(eq(clanId), any(ClanDto.UpdateRequest.class))).thenReturn(response);

        // When & Then
        mockMvc.perform(put("/api/clans/{id}", clanId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(clanId))
                .andExpect(jsonPath("$.name").value("업데이트된 클랜"))
                .andExpect(jsonPath("$.description").value("업데이트된 설명"))
                .andExpect(jsonPath("$.status").value("RUNNING"));

        verify(clanService, times(1)).updateClan(eq(clanId), any(ClanDto.UpdateRequest.class));
    }

    @Test
    @DisplayName("클랜 삭제 성공")
    void deleteClan_Success() throws Exception {
        // Given
        Long clanId = 1L;
        doNothing().when(clanService).deleteClan(clanId);

        // When & Then
        mockMvc.perform(delete("/api/clans/{id}", clanId))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(clanService, times(1)).deleteClan(clanId);
    }

    @Test
    @DisplayName("존재하지 않는 클랜 삭제 시 404 반환")
    void deleteClan_NotFound() throws Exception {
        // Given
        Long clanId = 999L;
        doThrow(new ResourceNotFoundException("Clan not found with id: " + clanId))
                .when(clanService).deleteClan(clanId);

        // When & Then
        mockMvc.perform(delete("/api/clans/{id}", clanId))
                .andDo(print())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Clan not found with id: " + clanId));

        verify(clanService, times(1)).deleteClan(clanId);
    }
}
