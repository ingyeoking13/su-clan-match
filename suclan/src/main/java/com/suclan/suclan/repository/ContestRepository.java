package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
}
