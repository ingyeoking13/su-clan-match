package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@SQLDelete(sql = """
        UPDATE player_clans
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "player_clans")
public class PlayerClan extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @ManyToOne
  @JoinColumn(name = "player_id")
  Player player;

  @ManyToOne
  @JoinColumn(name = "clan_id")
  Clan clan;

  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;

  LocalDateTime joinedAt;
  LocalDateTime exitedAt;
}
