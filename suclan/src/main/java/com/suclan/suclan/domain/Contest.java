package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@SQLDelete(sql = """
        UPDATE contests
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "contests")
public class Contest extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  String name;
  String description;

  @Builder.Default
  @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL)
  Set<Player> players = new HashSet<>();

  @Builder.Default
  @OneToMany(mappedBy = "contest", cascade = CascadeType.ALL)
  Set<Match> matches = new HashSet<>();

  @Builder.Default
  @ManyToMany
  Set<Clan> clans = new HashSet<>();

  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;

  @Builder.Default
  LocalDateTime startedAt = LocalDateTime.now();

  LocalDateTime endedAt;
}
