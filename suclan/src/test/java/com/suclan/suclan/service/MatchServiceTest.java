package com.suclan.suclan.service;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Contest;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.MatchRepository;
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
@DisplayName("MatchService 테스트")
class MatchServiceTest {

    @Mock
    private MatchRepository matchRepository;

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private ContestService contestService;

    @InjectMocks
    private MatchService matchService;

    @Test
    @DisplayName("매치 생성 성공 - 승자 없음")
    void createMatch_WithoutWinner_Success() {
        // Given
        Long playerOneId = 1L;
        Long playerTwoId = 2L;
        
        MatchDto.CreateRequest request = MatchDto.CreateRequest.builder()
                .playerOneId(playerOneId)
                .playerTwoId(playerTwoId)
                .mapName("테스트맵")
                .description("테스트 매치")
                .build();

        Player playerOne = Player.builder()
                .id(playerOneId)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        Player playerTwo = Player.builder()
                .id(playerTwoId)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        Match savedMatch = Match.builder()
                .id(1L)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .mapName("테스트맵")
                .description("테스트 매치")
                .status(EntityStatus.REGISTERED)
                .build();
        savedMatch.setCreatedAt(LocalDateTime.now());
        savedMatch.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.findById(playerOneId)).thenReturn(Optional.of(playerOne));
        when(playerRepository.findById(playerTwoId)).thenReturn(Optional.of(playerTwo));
        when(matchRepository.save(any(Match.class))).thenReturn(savedMatch);

        // When
        MatchDto.Response response = matchService.createMatch(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getPlayerOne().getNickname()).isEqualTo("플레이어1");
        assertThat(response.getPlayerTwo().getNickname()).isEqualTo("플레이어2");
        assertThat(response.getWinner()).isNull();
        assertThat(response.getLoser()).isNull();
        assertThat(response.getMapName()).isEqualTo("테스트맵");

        verify(playerRepository, times(1)).findById(playerOneId);
        verify(playerRepository, times(1)).findById(playerTwoId);
        verify(matchRepository, times(1)).save(any(Match.class));
    }

    @Test
    @DisplayName("매치 생성 성공 - 승자 포함")
    void createMatch_WithWinner_Success() {
        // Given
        Long playerOneId = 1L;
        Long playerTwoId = 2L;
        Long winnerId = playerOneId;
        
        MatchDto.CreateRequest request = MatchDto.CreateRequest.builder()
                .playerOneId(playerOneId)
                .playerTwoId(playerTwoId)
                .winnerId(winnerId)
                .mapName("테스트맵")
                .description("테스트 매치")
                .build();

        Player playerOne = Player.builder()
                .id(playerOneId)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        Player playerTwo = Player.builder()
                .id(playerTwoId)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        Match savedMatch = Match.builder()
                .id(1L)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerOne)
                .loser(playerTwo)
                .mapName("테스트맵")
                .description("테스트 매치")
                .status(EntityStatus.REGISTERED)
                .build();
        savedMatch.setCreatedAt(LocalDateTime.now());
        savedMatch.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.findById(playerOneId)).thenReturn(Optional.of(playerOne));
        when(playerRepository.findById(playerTwoId)).thenReturn(Optional.of(playerTwo));
        when(playerRepository.findById(winnerId)).thenReturn(Optional.of(playerOne));
        when(matchRepository.save(any(Match.class))).thenReturn(savedMatch);

        // When
        MatchDto.Response response = matchService.createMatch(request);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getWinner().getNickname()).isEqualTo("플레이어1");
        assertThat(response.getLoser().getNickname()).isEqualTo("플레이어2");

        verify(playerRepository, times(2)).findById(playerOneId); // playerOne과 winner로 2번 조회
        verify(playerRepository, times(1)).findById(playerTwoId);
        verify(matchRepository, times(1)).save(any(Match.class));
    }

    @Test
    @DisplayName("매치 생성 시 대회 포함")
    void createMatch_WithContest_Success() {
        // Given
        Long playerOneId = 1L;
        Long playerTwoId = 2L;
        Long contestId = 1L;
        
        MatchDto.CreateRequest request = MatchDto.CreateRequest.builder()
                .playerOneId(playerOneId)
                .playerTwoId(playerTwoId)
                .contestId(contestId)
                .mapName("테스트맵")
                .build();

        Player playerOne = Player.builder()
                .id(playerOneId)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        Player playerTwo = Player.builder()
                .id(playerTwoId)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        Contest contest = Contest.builder()
                .id(contestId)
                .name("테스트 대회")
                .status(EntityStatus.RUNNING)
                .build();

        Match savedMatch = Match.builder()
                .id(1L)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .contest(contest)
                .mapName("테스트맵")
                .status(EntityStatus.REGISTERED)
                .build();
        savedMatch.setCreatedAt(LocalDateTime.now());
        savedMatch.setUpdatedAt(LocalDateTime.now());

        when(playerRepository.findById(playerOneId)).thenReturn(Optional.of(playerOne));
        when(playerRepository.findById(playerTwoId)).thenReturn(Optional.of(playerTwo));
        when(contestService.findContestById(contestId)).thenReturn(contest);
        when(matchRepository.save(any(Match.class))).thenReturn(savedMatch);

        // When
        MatchDto.Response response = matchService.createMatch(request);

        // Then
        assertThat(response.getContest()).isNotNull();
        assertThat(response.getContest().getName()).isEqualTo("테스트 대회");

        verify(contestService, times(1)).findContestById(contestId);
    }

    @Test
    @DisplayName("존재하지 않는 플레이어로 매치 생성 시 예외 발생")
    void createMatch_PlayerNotFound() {
        // Given
        Long playerOneId = 999L;
        Long playerTwoId = 2L;
        
        MatchDto.CreateRequest request = MatchDto.CreateRequest.builder()
                .playerOneId(playerOneId)
                .playerTwoId(playerTwoId)
                .build();

        when(playerRepository.findById(playerOneId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> matchService.createMatch(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Player not found with id: " + playerOneId);

        verify(playerRepository, times(1)).findById(playerOneId);
        verify(matchRepository, never()).save(any(Match.class));
    }

    @Test
    @DisplayName("매치 조회 성공")
    void getMatch_Success() {
        // Given
        Long matchId = 1L;
        Player playerOne = Player.builder()
                .id(1L)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        Player playerTwo = Player.builder()
                .id(2L)
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        Match match = Match.builder()
                .id(matchId)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(playerOne)
                .loser(playerTwo)
                .mapName("테스트맵")
                .status(EntityStatus.REGISTERED)
                .build();
        match.setCreatedAt(LocalDateTime.now());
        match.setUpdatedAt(LocalDateTime.now());

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(match));

        // When
        MatchDto.Response response = matchService.getMatch(matchId);

        // Then
        assertThat(response.getId()).isEqualTo(matchId);
        assertThat(response.getPlayerOne().getNickname()).isEqualTo("플레이어1");
        assertThat(response.getPlayerTwo().getNickname()).isEqualTo("플레이어2");
        assertThat(response.getWinner().getNickname()).isEqualTo("플레이어1");

        verify(matchRepository, times(1)).findById(matchId);
    }

    @Test
    @DisplayName("특정 플레이어의 매치 목록 조회 성공")
    void getMatchesByPlayer_Success() {
        // Given
        Long playerId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        
        Player player = Player.builder()
                .id(playerId)
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        Player opponent = Player.builder()
                .id(2L)
                .nickname("상대방")
                .status(EntityStatus.REGISTERED)
                .build();

        Match match1 = Match.builder()
                .id(1L)
                .playerOne(player)
                .playerTwo(opponent)
                .mapName("맵1")
                .build();
        match1.setCreatedAt(LocalDateTime.now());

        Match match2 = Match.builder()
                .id(2L)
                .playerOne(opponent)
                .playerTwo(player)
                .mapName("맵2")
                .build();
        match2.setCreatedAt(LocalDateTime.now());

        Page<Match> matchPage = new PageImpl<>(Arrays.asList(match1, match2), pageable, 2);
        when(matchRepository.findByPlayerOneIdOrPlayerTwoId(playerId, playerId, pageable))
                .thenReturn(matchPage);

        // When
        Page<MatchDto.Summary> result = matchService.getMatchesByPlayer(playerId, MatchDto.PlayerSpecificCondition.builder().build(), pageable);

        // Then
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getMapName()).isEqualTo("맵1");
        assertThat(result.getContent().get(1).getMapName()).isEqualTo("맵2");

        verify(matchRepository, times(1)).findByPlayerOneIdOrPlayerTwoId(playerId, playerId, pageable);
    }

    @Test
    @DisplayName("매치 업데이트 성공")
    void updateMatch_Success() {
        // Given
        Long matchId = 1L;
        Long winnerId = 1L;
        
        MatchDto.UpdateRequest request = MatchDto.UpdateRequest.builder()
                .winnerId(winnerId)
                .mapName("업데이트된맵")
                .description("업데이트된 설명")
                .status(EntityStatus.RUNNING)
                .build();

        Player playerOne = Player.builder()
                .id(1L)
                .nickname("플레이어1")
                .build();

        Player playerTwo = Player.builder()
                .id(2L)
                .nickname("플레이어2")
                .build();

        Match existingMatch = Match.builder()
                .id(matchId)
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .mapName("기존맵")
                .status(EntityStatus.REGISTERED)
                .build();
        existingMatch.setCreatedAt(LocalDateTime.now());
        existingMatch.setUpdatedAt(LocalDateTime.now());

        when(matchRepository.findById(matchId)).thenReturn(Optional.of(existingMatch));
        when(playerRepository.findById(winnerId)).thenReturn(Optional.of(playerOne));
        when(matchRepository.save(any(Match.class))).thenReturn(existingMatch);

        // When
        MatchDto.Response response = matchService.updateMatch(matchId, request);

        // Then
        assertThat(response.getWinner().getNickname()).isEqualTo("플레이어1");
        assertThat(response.getLoser().getNickname()).isEqualTo("플레이어2");
        assertThat(response.getMapName()).isEqualTo("업데이트된맵");
        assertThat(response.getDescription()).isEqualTo("업데이트된 설명");
        assertThat(response.getStatus()).isEqualTo(EntityStatus.RUNNING);

        verify(matchRepository, times(1)).findById(matchId);
        verify(playerRepository, times(1)).findById(winnerId);
        verify(matchRepository, times(1)).save(existingMatch);
    }

    @Test
    @DisplayName("매치 삭제 성공")
    void deleteMatch_Success() {
        // Given
        Long matchId = 1L;
        when(matchRepository.existsById(matchId)).thenReturn(true);

        // When
        matchService.deleteMatch(matchId);

        // Then
        verify(matchRepository, times(1)).existsById(matchId);
        verify(matchRepository, times(1)).deleteById(matchId);
    }

    @Test
    @DisplayName("존재하지 않는 매치 삭제 시 예외 발생")
    void deleteMatch_NotFound() {
        // Given
        Long matchId = 999L;
        when(matchRepository.existsById(matchId)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> matchService.deleteMatch(matchId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Match not found with id: " + matchId);

        verify(matchRepository, times(1)).existsById(matchId);
        verify(matchRepository, never()).deleteById(anyLong());
    }
}
