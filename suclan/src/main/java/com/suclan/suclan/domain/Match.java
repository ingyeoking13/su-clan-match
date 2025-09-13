package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.constant.Race;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.util.Lazy;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Setter
@SQLDelete(sql = """
        UPDATE matches
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "matches")
public class Match extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="player_one_id")
  Player playerOne;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="player_two_id")
  Player playerTwo;

  @Enumerated(EnumType.STRING)
  Race playerOneRace;

  @Enumerated(EnumType.STRING)
  Race playerTwoRace;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "winner_id")
  Player winner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "loser_id")
  Player loser;

  String mapName;
  String description;
  String streamingUrl;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="contest_id")
  Contest contest;

  LocalDateTime matchTime;

  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;
}
