package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@SQLDelete(sql = """
        UPDATE grades
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "grades")
public class Grade extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  String name;
  String description;

  @Builder.Default
  @ManyToMany
  Set<Player> players = new HashSet<>();


  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;
}
