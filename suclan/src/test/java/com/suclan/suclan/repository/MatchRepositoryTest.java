package com.suclan.suclan.repository;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("MatchRepository 테스트")
class MatchRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private PlayerRepository playerRepository;

    private Player player1;
    private Player player2;
    private Player player3;

    @BeforeEach
    void setUp() {
        player1 = Player.builder()
                .nickname("플레이어1")
                .status(EntityStatus.REGISTERED)
                .build();

        player2 = Player.builder()
                .nickname("플레이어2")
                .status(EntityStatus.REGISTERED)
                .build();

        player3 = Player.builder()
                .nickname("플레이어3")
                .status(EntityStatus.REGISTERED)
                .build();

        player1 = playerRepository.save(player1);
        player2 = playerRepository.save(player2);
        player3 = playerRepository.save(player3);
        entityManager.flush();
    }

    @Test
    @DisplayName("매치 저장 및 조회 성공")
    void save_and_findById_Success() {
        // Given
        Match match = Match.builder()
                .playerOne(player1)
                .playerTwo(player2)
                .winner(player1)
                .loser(player2)
                .mapName("테스트맵")
                .description("테스트 매치")
                .status(EntityStatus.REGISTERED)
                .build();

        // When
        Match savedMatch = matchRepository.save(match);
        entityManager.flush();
        entityManager.clear();

        // Then
        Optional<Match> foundMatch = matchRepository.findById(savedMatch.getId());
        assertThat(foundMatch).isPresent();
        assertThat(foundMatch.get().getPlayerOne().getNickname()).isEqualTo("플레이어1");
        assertThat(foundMatch.get().getPlayerTwo().getNickname()).isEqualTo("플레이어2");
        assertThat(foundMatch.get().getWinner().getNickname()).isEqualTo("플레이어1");
        assertThat(foundMatch.get().getLoser().getNickname()).isEqualTo("플레이어2");
        assertThat(foundMatch.get().getMapName()).isEqualTo("테스트맵");
        assertThat(foundMatch.get().getDescription()).isEqualTo("테스트 매치");
        assertThat(foundMatch.get().getStatus()).isEqualTo(EntityStatus.REGISTERED);
        assertThat(foundMatch.get().getCreatedAt()).isNotNull();
        assertThat(foundMatch.get().getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("특정 플레이어가 참가한 매치 조회 성공")
    void findByPlayerOneIdOrPlayerTwoId_Success() {
        // Given
        Match match1 = Match.builder()
                .playerOne(player1)
                .playerTwo(player2)
                .mapName("맵1")
                .status(EntityStatus.REGISTERED)
                .build();

        Match match2 = Match.builder()
                .playerOne(player2)
                .playerTwo(player3)
                .mapName("맵2")
                .status(EntityStatus.REGISTERED)
                .build();

        Match match3 = Match.builder()
                .playerOne(player3)
                .playerTwo(player1)
                .mapName("맵3")
                .status(EntityStatus.REGISTERED)
                .build();

        matchRepository.save(match1);
        matchRepository.save(match2);
        matchRepository.save(match3);
        entityManager.flush();

        // When - player1이 참가한 매치 조회
        Page<Match> player1Matches = matchRepository.findByPlayerOneIdOrPlayerTwoId(
                player1.getId(), player1.getId(), PageRequest.of(0, 10));

        // When - player2가 참가한 매치 조회
        Page<Match> player2Matches = matchRepository.findByPlayerOneIdOrPlayerTwoId(
                player2.getId(), player2.getId(), PageRequest.of(0, 10));

        // Then
        assertThat(player1Matches.getContent()).hasSize(2); // match1, match3
        assertThat(player1Matches.getContent())
                .extracting(Match::getMapName)
                .containsExactlyInAnyOrder("맵1", "맵3");

        assertThat(player2Matches.getContent()).hasSize(2); // match1, match2
        assertThat(player2Matches.getContent())
                .extracting(Match::getMapName)
                .containsExactlyInAnyOrder("맵1", "맵2");
    }

    @Test
    @DisplayName("특정 플레이어가 참가한 매치가 없는 경우")
    void findByPlayerOneIdOrPlayerTwoId_NoMatches() {
        // Given
        Player newPlayer = Player.builder()
                .nickname("새플레이어")
                .status(EntityStatus.REGISTERED)
                .build();
        newPlayer = playerRepository.save(newPlayer);
        entityManager.flush();

        // When
        Page<Match> matches = matchRepository.findByPlayerOneIdOrPlayerTwoId(
                newPlayer.getId(), newPlayer.getId(), PageRequest.of(0, 10));

        // Then
        assertThat(matches.getContent()).isEmpty();
        assertThat(matches.getTotalElements()).isEqualTo(0);
    }

    @Test
    @DisplayName("매치 페이징 조회 성공")
    void findAll_Paging_Success() {
        // Given
        for (int i = 1; i <= 5; i++) {
            Match match = Match.builder()
                    .playerOne(player1)
                    .playerTwo(player2)
                    .mapName("맵" + i)
                    .status(EntityStatus.REGISTERED)
                    .build();
            matchRepository.save(match);
        }
        entityManager.flush();

        // When
        Page<Match> firstPage = matchRepository.findAll(PageRequest.of(0, 2));
        Page<Match> secondPage = matchRepository.findAll(PageRequest.of(1, 2));

        // Then
        assertThat(firstPage.getContent()).hasSize(2);
        assertThat(firstPage.getTotalElements()).isEqualTo(5);
        assertThat(firstPage.getTotalPages()).isEqualTo(3);
        assertThat(firstPage.isFirst()).isTrue();
        assertThat(firstPage.isLast()).isFalse();

        assertThat(secondPage.getContent()).hasSize(2);
        assertThat(secondPage.isFirst()).isFalse();
        assertThat(secondPage.isLast()).isFalse();
    }

    @Test
    @DisplayName("매치 업데이트 성공")
    void update_Success() {
        // Given
        Match match = Match.builder()
                .playerOne(player1)
                .playerTwo(player2)
                .mapName("원래맵")
                .description("원래 설명")
                .status(EntityStatus.REGISTERED)
                .build();

        Match savedMatch = matchRepository.save(match);
        entityManager.flush();
        entityManager.clear();

        // When
        Match foundMatch = matchRepository.findById(savedMatch.getId()).get();
        foundMatch.setWinner(player2);
        foundMatch.setLoser(player1);
        foundMatch.setMapName("업데이트된맵");
        foundMatch.setDescription("업데이트된 설명");
        foundMatch.setStatus(EntityStatus.RUNNING);

        Match updatedMatch = matchRepository.save(foundMatch);
        entityManager.flush();

        // Then
        assertThat(updatedMatch.getWinner().getNickname()).isEqualTo("플레이어2");
        assertThat(updatedMatch.getLoser().getNickname()).isEqualTo("플레이어1");
        assertThat(updatedMatch.getMapName()).isEqualTo("업데이트된맵");
        assertThat(updatedMatch.getDescription()).isEqualTo("업데이트된 설명");
        assertThat(updatedMatch.getStatus()).isEqualTo(EntityStatus.RUNNING);
        assertThat(updatedMatch.getUpdatedAt()).isAfter(updatedMatch.getCreatedAt());
    }

    @Test
    @DisplayName("매치 존재 여부 확인")
    void existsById_Success() {
        // Given
        Match match = Match.builder()
                .playerOne(player1)
                .playerTwo(player2)
                .mapName("존재확인맵")
                .status(EntityStatus.REGISTERED)
                .build();

        Match savedMatch = matchRepository.save(match);
        entityManager.flush();

        // When & Then
        assertThat(matchRepository.existsById(savedMatch.getId())).isTrue();
        assertThat(matchRepository.existsById(999L)).isFalse();
    }

    @Test
    @DisplayName("존재하지 않는 매치 조회 시 빈 Optional 반환")
    void findById_NotExists_ReturnsEmpty() {
        // Given
        Long nonExistentId = 999L;

        // When
        Optional<Match> result = matchRepository.findById(nonExistentId);

        // Then
        assertThat(result).isEmpty();
    }
}
