package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Match;
import com.suclan.suclan.dto.OpponentSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    /**
     * 특정 플레이어가 참가한 매치 조회 (플레이어 1 또는 플레이어 2로 참가)
     */
    Page<Match> findByPlayerOneIdOrPlayerTwoId(Long playerOneId, Long playerTwoId, Pageable pageable);

  //      AND (p2.nickname LIKE :oppo or p.nickname LIKE :oppo)
  @Query(value = """
    SELECT
      CASE
        WHEN m.player_one_id = :playerId THEN m.player_two_id
        ELSE m.player_one_id
      END AS opponent_id,
      COUNT(*) AS total_count,
      SUM(CASE WHEN m.winner_id = :playerId THEN 1 ELSE 0 END) AS win,
      SUM(CASE WHEN m.loser_id = :playerId THEN 1 ELSE 0 END) AS lose
    FROM matches m
    JOIN players p ON (m.player_one_id = p.id)
    JOIN players p2 ON (m.player_two_id = p2.id)
    WHERE m.status = 'REGISTERED'
      AND (m.player_one_id = :playerId OR m.player_two_id = :playerId)
    GROUP BY opponent_id
    """, nativeQuery = true)
  Page<OpponentSummary> findOpponentSummaries(@Param("playerId") Long playerId,
                                              @Param("oppo") String opponentName,
                                              Pageable pageable);
}
