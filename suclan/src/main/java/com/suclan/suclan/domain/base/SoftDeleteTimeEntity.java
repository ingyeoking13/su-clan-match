package com.suclan.suclan.domain.base;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@MappedSuperclass
public class SoftDeleteTimeEntity extends BaseTimeEntity {

  private LocalDateTime deletedAt;

  public void restore(){
    deletedAt = null;
  }
}
