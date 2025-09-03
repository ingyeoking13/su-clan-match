package com.suclan.suclan.service;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Grade;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.GradeRepository;
import com.suclan.suclan.repository.PlayerRepository;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PlayerService 테스트")
class PlayerServiceTest {

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private GradeRepository gradeRepository;

    @InjectMocks
    private PlayerService playerService;

    @Test
    @DisplayName("플레이어 생성 성공 - 등급 없음")
    void createPlayer_WithoutGrade_Success() {
        // Given
        PlayerDto.CreateRequest request = PlayerDto.CreateRequest.builder()
                .nickname("테스트플레이어")
                .build();

        Player savedPlayer = Player.builder()
                .id(1L)
                .nickname("테스트플레이어")
                .status(EntityStatus.REGISTERED)
                .build();
        savedPlayer.setCreatedAt(LocalDateTime.now());
        savedPlayer.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.save(any(Player.class))).thenReturn(savedPlayer);

        // When
        PlayerDto.Response response = playerService.createPlayer(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNickname()).isEqualTo("테스트플레이어");
        assertThat(response.getGrade()).isNull();
        assertThat(response.getStatus()).isEqualTo(EntityStatus.REGISTERED);
        assertThat(response.getTotalMatches()).isEqualTo(0);

        verify(playerRepository, times(1)).save(any(Player.class));
        verify(gradeRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("플레이어 생성 성공 - 등급 포함")
    void createPlayer_WithGrade_Success() {
        // Given
        Long gradeId = 1L;
        PlayerDto.CreateRequest request = PlayerDto.CreateRequest.builder()
                .nickname("테스트플레이어")
                .gradeId(gradeId)
                .build();

        Grade grade = Grade.builder()
                .id(gradeId)
                .name("브론즈")
                .status(EntityStatus.REGISTERED)
                .build();

        Player savedPlayer = Player.builder()
                .id(1L)
                .nickname("테스트플레이어")
                .grade(grade)
                .status(EntityStatus.REGISTERED)
                .wins(new HashSet<>())
                .losses(new HashSet<>())
                .build();
        savedPlayer.setCreatedAt(LocalDateTime.now());
        savedPlayer.setUpdatedAt(LocalDateTime.now());

        when(gradeRepository.findById(gradeId)).thenReturn(Optional.of(grade));
        when(playerRepository.save(any(Player.class))).thenReturn(savedPlayer);

        // When
        PlayerDto.Response response = playerService.createPlayer(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNickname()).isEqualTo("테스트플레이어");
        assertThat(response.getGrade()).isNotNull();
        assertThat(response.getGrade().getName()).isEqualTo("브론즈");
        assertThat(response.getStatus()).isEqualTo(EntityStatus.REGISTERED);

        verify(gradeRepository, times(1)).findById(gradeId);
        verify(playerRepository, times(1)).save(any(Player.class));
    }

    @Test
    @DisplayName("존재하지 않는 등급으로 플레이어 생성 시 예외 발생")
    void createPlayer_GradeNotFound() {
        // Given
        Long gradeId = 999L;
        PlayerDto.CreateRequest request = PlayerDto.CreateRequest.builder()
                .nickname("테스트플레이어")
                .gradeId(gradeId)
                .build();

        when(gradeRepository.findById(gradeId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> playerService.createPlayer(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Grade not found with id: " + gradeId);

        verify(gradeRepository, times(1)).findById(gradeId);
        verify(playerRepository, never()).save(any(Player.class));
    }

    @Test
    @DisplayName("플레이어 조회 성공")
    void getPlayer_Success() {
        // Given
        Long playerId = 1L;
        Grade grade = Grade.builder()
                .id(1L)
                .name("브론즈")
                .status(EntityStatus.REGISTERED)
                .build();

        Player player = Player.builder()
                .id(playerId)
                .nickname("테스트플레이어")
                .grade(grade)
                .status(EntityStatus.REGISTERED)
                .wins(new HashSet<>())
                .losses(new HashSet<>())
                .build();
        player.setCreatedAt(LocalDateTime.now());
        player.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.findById(playerId)).thenReturn(Optional.of(player));

        // When
        PlayerDto.Response response = playerService.getPlayer(playerId);

        // Then
        assertThat(response.getId()).isEqualTo(playerId);
        assertThat(response.getNickname()).isEqualTo("테스트플레이어");
        assertThat(response.getGrade().getName()).isEqualTo("브론즈");

        verify(playerRepository, times(1)).findById(playerId);
    }

    @Test
    @DisplayName("존재하지 않는 플레이어 조회 시 예외 발생")
    void getPlayer_NotFound() {
        // Given
        Long playerId = 999L;
        when(playerRepository.findById(playerId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> playerService.getPlayer(playerId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Player not found with id: " + playerId);

        verify(playerRepository, times(1)).findById(playerId);
    }

    @Test
    @DisplayName("플레이어 목록 조회 성공")
    void getAllPlayers_Success() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Player player1 = Player.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .wins(new HashSet<>())
                .build();
        Player player2 = Player.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .wins(new HashSet<>())
                .build();

        Page<Player> playerPage = new PageImpl<>(Arrays.asList(player1, player2), pageable, 2);
        when(playerRepository.findAll(pageable)).thenReturn(playerPage);

        // When
        Page<PlayerDto.Summary> result = playerService.getAllPlayers(pageable, true, new PlayerDto.SearchCondition());

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getNickname()).isEqualTo("플레이어1");
        assertThat(result.getContent().get(1).getNickname()).isEqualTo("플레이어2");

        verify(playerRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("플레이어 업데이트 성공")
    void updatePlayer_Success() {
        // Given
        Long playerId = 1L;
        Long newGradeId = 2L;
        
        PlayerDto.UpdateRequest request = PlayerDto.UpdateRequest.builder()
                .nickname("업데이트된플레이어")
                .gradeId(newGradeId)
                .status(EntityStatus.RUNNING)
                .build();

        Grade newGrade = Grade.builder()
                .id(newGradeId)
                .name("실버")
                .status(EntityStatus.REGISTERED)
                .build();

        Player existingPlayer = Player.builder()
                .id(playerId)
                .nickname("기존플레이어")
                .status(EntityStatus.REGISTERED)
                .wins(new HashSet<>())
                .build();
        existingPlayer.setCreatedAt(LocalDateTime.now());
        existingPlayer.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.findById(playerId)).thenReturn(Optional.of(existingPlayer));
        when(gradeRepository.findById(newGradeId)).thenReturn(Optional.of(newGrade));
        when(playerRepository.save(any(Player.class))).thenReturn(existingPlayer);

        // When
        PlayerDto.Response response = playerService.updatePlayer(playerId, request);

        // Then
        assertThat(response.getNickname()).isEqualTo("업데이트된플레이어");
        assertThat(response.getGrade().getName()).isEqualTo("실버");
        assertThat(response.getStatus()).isEqualTo(EntityStatus.RUNNING);

        verify(playerRepository, times(1)).findById(playerId);
        verify(gradeRepository, times(1)).findById(newGradeId);
        verify(playerRepository, times(1)).save(existingPlayer);
    }

    @Test
    @DisplayName("플레이어 삭제 성공")
    void deletePlayer_Success() {
        // Given
        Long playerId = 1L;
        when(playerRepository.existsById(playerId)).thenReturn(true);

        // When
        playerService.deletePlayer(playerId);

        // Then
        verify(playerRepository, times(1)).existsById(playerId);
        verify(playerRepository, times(1)).deleteById(playerId);
    }

    @Test
    @DisplayName("존재하지 않는 플레이어 삭제 시 예외 발생")
    void deletePlayer_NotFound() {
        // Given
        Long playerId = 999L;
        when(playerRepository.existsById(playerId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> playerService.deletePlayer(playerId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Player not found with id: " + playerId);

        verify(playerRepository, times(1)).existsById(playerId);
        verify(playerRepository, never()).deleteById(anyLong());
    }
}
