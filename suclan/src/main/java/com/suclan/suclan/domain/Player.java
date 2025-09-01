package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@SQLDelete(sql = """
        UPDATE players
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "players")
public class Player extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  String nickname;

  @ManyToOne
  @JoinColumn(name="grade_id")
  Grade grade;

  @ManyToMany
  @Builder.Default
  Set<Contest> contest = new HashSet<>();

  @OneToMany(mappedBy = "winner", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @Builder.Default
  Set<Match> wins = new HashSet<>();

  @OneToMany(mappedBy = "loser", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @Builder.Default
  Set<Match> losses = new HashSet<>();

  @OneToMany(mappedBy = "player", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @Builder.Default
  Set<PlayerClan> playerClans = new HashSet<>();

  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;
}
