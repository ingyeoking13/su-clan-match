package com.suclan.suclan.repository;


import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Clan;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.domain.PlayerClan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlayerClanRepository extends JpaRepository<PlayerClan, Long> {

  // 특정 플레이어의 활성 클랜 관계 삭제
  @Modifying
  @Query("DELETE FROM PlayerClan pc WHERE pc.player = :player")
  void deleteByPlayerAndStatus(@Param("player") Player player);

  // 특정 플레이어의 현재 클랜 조회
  @Query("SELECT pc FROM PlayerClan pc WHERE pc.player = :player AND pc.status = :status")
  Optional<PlayerClan> findByPlayerAndStatus(@Param("player") Player player, @Param("status") EntityStatus status);

  // 특정 클랜의 모든 활성 멤버 조회
  @Query("SELECT pc FROM PlayerClan pc WHERE pc.clan = :clan AND pc.status = :status")
  List<PlayerClan> findByClanAndStatus(@Param("clan") Clan clan, @Param("status") EntityStatus status);
}