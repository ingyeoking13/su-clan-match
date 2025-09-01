package com.suclan.suclan.service;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Clan;
import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.ClanRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClanService 테스트")
class ClanServiceTest {

    @Mock
    private ClanRepository clanRepository;

    @InjectMocks
    private ClanService clanService;

    @Test
    @DisplayName("클랜 생성 성공")
    void createClan_Success() {
        // Given
        ClanDto.CreateRequest request = ClanDto.CreateRequest.builder()
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .build();

        Clan savedClan = Clan.builder()
                .id(1L)
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .status(EntityStatus.REGISTERED)
                .playerClan(new HashSet<>())
                .build();
        savedClan.setCreatedAt(LocalDateTime.now());
        savedClan.setUpdatedAt(LocalDateTime.now());

        when(clanRepository.save(any(Clan.class))).thenReturn(savedClan);

        // When
        ClanDto.Response response = clanService.createClan(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("테스트 클랜");
        assertThat(response.getDescription()).isEqualTo("테스트 클랜입니다");
        assertThat(response.getStatus()).isEqualTo(EntityStatus.REGISTERED);
        assertThat(response.getMemberCount()).isEqualTo(0);

        verify(clanRepository, times(1)).save(any(Clan.class));
    }

    @Test
    @DisplayName("클랜 조회 성공")
    void getClan_Success() {
        // Given
        Long clanId = 1L;
        Clan clan = Clan.builder()
                .id(clanId)
                .name("테스트 클랜")
                .description("테스트 클랜입니다")
                .foundingDate(LocalDate.now())
                .status(EntityStatus.REGISTERED)
                .playerClan(new HashSet<>())
                .build();
        clan.setCreatedAt(LocalDateTime.now());
        clan.setUpdatedAt(LocalDateTime.now());

        when(clanRepository.findById(clanId)).thenReturn(Optional.of(clan));

        // When
        ClanDto.Response response = clanService.getClan(clanId);

        // Then
        assertThat(response.getId()).isEqualTo(clanId);
        assertThat(response.getName()).isEqualTo("테스트 클랜");
        assertThat(response.getDescription()).isEqualTo("테스트 클랜입니다");

        verify(clanRepository, times(1)).findById(clanId);
    }

    @Test
    @DisplayName("존재하지 않는 클랜 조회 시 예외 발생")
    void getClan_NotFound() {
        // Given
        Long clanId = 999L;
        when(clanRepository.findById(clanId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> clanService.getClan(clanId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Clan not found with id: " + clanId);

        verify(clanRepository, times(1)).findById(clanId);
    }

    @Test
    @DisplayName("클랜 목록 조회 성공")
    void getAllClans_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Clan clan1 = Clan.builder()
                .id(1L)
                .name("클랜1")
                .status(EntityStatus.REGISTERED)
                .playerClan(new HashSet<>())
                .build();
        Clan clan2 = Clan.builder()
                .id(2L)
                .name("클랜2")
                .status(EntityStatus.REGISTERED)
                .playerClan(new HashSet<>())
                .build();

        Page<Clan> clanPage = new PageImpl<>(Arrays.asList(clan1, clan2), pageable, 2);
        when(clanRepository.findAll(pageable)).thenReturn(clanPage);

        // When
        Page<ClanDto.Summary> result = clanService.getAllClans(pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getName()).isEqualTo("클랜1");
        assertThat(result.getContent().get(1).getName()).isEqualTo("클랜2");

        verify(clanRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("클랜 업데이트 성공")
    void updateClan_Success() {
        // Given
        Long clanId = 1L;
        ClanDto.UpdateRequest request = ClanDto.UpdateRequest.builder()
                .name("업데이트된 클랜")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .build();

        Clan existingClan = Clan.builder()
                .id(clanId)
                .name("기존 클랜")
                .description("기존 설명")
                .status(EntityStatus.REGISTERED)
                .playerClan(new HashSet<>())
                .build();
        existingClan.setCreatedAt(LocalDateTime.now());
        existingClan.setUpdatedAt(LocalDateTime.now());

        when(clanRepository.findById(clanId)).thenReturn(Optional.of(existingClan));
        when(clanRepository.save(any(Clan.class))).thenReturn(existingClan);

        // When
        ClanDto.Response response = clanService.updateClan(clanId, request);

        // Then
        assertThat(response.getName()).isEqualTo("업데이트된 클랜");
        assertThat(response.getDescription()).isEqualTo("업데이트된 설명");
        assertThat(response.getStatus()).isEqualTo(EntityStatus.RUNNING);

        verify(clanRepository, times(1)).findById(clanId);
        verify(clanRepository, times(1)).save(existingClan);
    }

    @Test
    @DisplayName("클랜 삭제 성공")
    void deleteClan_Success() {
        // Given
        Long clanId = 1L;
        when(clanRepository.existsById(clanId)).thenReturn(true);

        // When
        clanService.deleteClan(clanId);

        // Then
        verify(clanRepository, times(1)).existsById(clanId);
        verify(clanRepository, times(1)).deleteById(clanId);
    }

    @Test
    @DisplayName("존재하지 않는 클랜 삭제 시 예외 발생")
    void deleteClan_NotFound() {
        // Given
        Long clanId = 999L;
        when(clanRepository.existsById(clanId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> clanService.deleteClan(clanId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Clan not found with id: " + clanId);

        verify(clanRepository, times(1)).existsById(clanId);
        verify(clanRepository, never()).deleteById(anyLong());
    }
}
