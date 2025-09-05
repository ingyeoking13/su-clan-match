package com.suclan.suclan.repository;

import com.suclan.suclan.domain.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {

  Optional<Grade> findByName(String name);
}
