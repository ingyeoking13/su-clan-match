package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PlayerRepository extends JpaRepository<Player, Long> {

  boolean existsByNickname(String username);
  Optional<Player> findByNickname(String username);
}
