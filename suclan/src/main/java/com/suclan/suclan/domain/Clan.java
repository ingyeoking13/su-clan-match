package com.suclan.suclan.domain;

import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.base.SoftDeleteTimeEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.time.LocalDate;
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
        UPDATE clans
        SET deleted_at = CURRENT_TIMESTAMP,
            status = 'DELETED'
        WHERE id = ?
""" )
@Table(name = "clans")
public class Clan extends SoftDeleteTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  String name;
  String description;

  @Builder.Default
  @OneToMany(mappedBy = "clan", cascade = CascadeType.ALL)
  Set<PlayerClan> playerClan = new HashSet<>();

  @Builder.Default
  LocalDate foundingDate = LocalDate.now();

  LocalDate closingDate;

  @Enumerated(EnumType.STRING)
  @Builder.Default
  EntityStatus status = EntityStatus.REGISTERED;
}
