package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Match;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    
    /**
     * 특정 플레이어가 참가한 매치 조회 (플레이어 1 또는 플레이어 2로 참가)
     */
    Page<Match> findByPlayerOneIdOrPlayerTwoId(Long playerOneId, Long playerTwoId, Pageable pageable);
}
