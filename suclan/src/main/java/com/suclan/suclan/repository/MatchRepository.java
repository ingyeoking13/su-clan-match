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
       WITH base_cte AS (
          SELECT
            CASE
              WHEN m.player_one_id = :playerId THEN m.player_two_id
              ELSE m.player_one_id
            END AS opponent_id,
            m.winner_id,
            m.loser_id
          FROM matches m
          WHERE m.status = 'REGISTERED'
            AND (m.player_one_id = :playerId OR m.player_two_id = :playerId)
        )
        SELECT 
          opponent_id,
          COUNT(*) as total_count,
          SUM(CASE WHEN winner_id = :playerId THEN 1 END) as win,
          SUM(CASE WHEN loser_id = :playerId THEN 1 END) as lose
        From base_cte
        GROUP BY opponent_id
    """, countQuery = """
        SELECT COUNT(
          DISTINCT (CASE WHEN m.player_one_id = :playerId THEN m.player_two_id ELSE m.player_one_id END)
        )
        FROM matches m
        WHERE m.status = 'REGISTERED'
            AND (m.player_one_id = :playerId OR m.player_two_id = :playerId)
      """
      , nativeQuery = true)
  Page<OpponentSummary> findOpponentSummaries(@Param("playerId") Long playerId,
                                              @Param("oppo") Long opponentId,
                                              Pageable pageable);
}
