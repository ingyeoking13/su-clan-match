package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PlayerRepository extends JpaRepository<Player, Long> {

  boolean existsByNickname(String username);
}
