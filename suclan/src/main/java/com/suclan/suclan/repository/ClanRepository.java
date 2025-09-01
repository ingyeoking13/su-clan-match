package com.suclan.suclan.repository;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Clan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClanRepository extends JpaRepository<Clan, Long> {
  Page<Clan> findAllByStatusNot(EntityStatus status, Pageable pageable);
  Optional<Clan> findByName(String name);
}
