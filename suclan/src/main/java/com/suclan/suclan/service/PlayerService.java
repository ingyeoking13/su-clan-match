package com.suclan.suclan.service;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Clan;
import com.suclan.suclan.domain.Grade;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.domain.PlayerClan;
import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.dto.GradeDto;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.ClanRepository;
import com.suclan.suclan.repository.GradeRepository;
import com.suclan.suclan.repository.PlayerClanRepository;
import com.suclan.suclan.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.suclan.suclan.domain.QPlayer.player;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final GradeRepository gradeRepository;
    private final ClanRepository clanRepository;
    private final PlayerClanRepository playerClanRepository;
    private final JPAQueryFactory jpaQueryFactory;

    @Transactional
    public PlayerDto.Response createPlayer(PlayerDto.CreateRequest request) {
        Grade grade = null;
        if (request.getGradeName() != null) {
            grade = gradeRepository.findByName(request.getGradeName())
                .orElseThrow(() -> {
                  log.error("{} not found", request.getGradeName());
                return new ResourceNotFoundException("Grade not found with id: " + request.getGradeName());
              });
        }

        if (playerRepository.existsByNickname(request.getNickname())) {
          log.error("이미 사용되고 있는 이름입니다 {}", request.getNickname());
          throw new IllegalArgumentException("이미 사용되고 있는 이름입니다. " + request.getNickname());
        }

        Player player = Player.builder()
                .nickname(request.getNickname())
                .race(request.getRace())
                .grade(grade)
                .build();

      if (request.getClanName() != null) {
        Clan clan = clanRepository.findByName(request.getClanName()).orElseThrow(
            () -> new ResourceNotFoundException("Clan not found with name: " + request.getClanName())
        );
        PlayerClan pc = PlayerClan.builder()
            .player(player)
            .clan(clan)
            .build();
        playerClanRepository.save(pc);
      }
      Player savedPlayer = playerRepository.save(player);
      return convertToResponse(savedPlayer);
    }

    @Transactional
    public PlayerDto.Response updatePlayer(Long id, PlayerDto.UpdateRequest request) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));

        if (request.getNickname() != null) {
            player.setNickname(request.getNickname());
        }
        if (request.getGradeName() != null) {
            Grade grade = gradeRepository.findByName(request.getGradeName())
                    .orElseThrow(() -> new ResourceNotFoundException("Grade not found with id: " + request.getGradeName()));
            player.setGrade(grade);
        }
        if (request.getStatus() != null) {
            player.setStatus(request.getStatus());
        }
        if (request.getRace() != null) {
            player.setRace(request.getRace());
        }

        if (request.getClanName() != null) {
          Clan clan  = clanRepository.findByName(request.getClanName()).orElseThrow(
              () -> new ResourceNotFoundException("Clan not found with name: " + request.getClanName())
          );

          playerClanRepository.deleteByPlayerAndStatus(player);

          PlayerClan pc = PlayerClan.builder()
              .player(player)
              .clan(clan)
              .build();
          playerClanRepository.save(pc);
        }

        Player updatedPlayer = playerRepository.save(player);
        return convertToResponse(updatedPlayer);
    }

    @Transactional
    public PlayerDto.Response getPlayer(Long id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + id));
        return convertToResponse(player);
    }

    @Transactional
    public Page<PlayerDto.Summary> getAllPlayers(Pageable pageable, boolean includeDeleted, PlayerDto.SearchCondition searchCondition) {
      BooleanExpression stateCondition = includeDeleted
          ? player.status.in(EntityStatus.REGISTERED, EntityStatus.DELETED)
          : player.status.eq(EntityStatus.REGISTERED);

     BooleanExpression nameCondition =
         StringUtils.hasText(searchCondition.getNickname())?player.nickname.like("%" + searchCondition.getNickname() + "%"):null;

      var query = jpaQueryFactory
          .selectFrom(player)
          .where(stateCondition, nameCondition)
          .offset(pageable.getOffset())
          .limit(pageable.getPageSize());


      List<OrderSpecifier<?>> orders = new ArrayList<>();
      for (Sort.Order o : pageable.getSort()) {
        PathBuilder<Player> entityPath = new PathBuilder<>(player.getType(), player.getMetadata());
        Order dir = o.isAscending() ? Order.ASC : Order.DESC;

        if (o.getProperty().equalsIgnoreCase("losses")) {
          orders.add(new OrderSpecifier<>(dir,player.losses.size()));
        } else if (o.getProperty().equalsIgnoreCase("wins")) {
          orders.add(new OrderSpecifier<>(dir, player.wins.size()));
        } else if (o.getProperty().equalsIgnoreCase("totalMatches")) {
          orders.add(new OrderSpecifier<>(dir, player.wins.size().add(player.losses.size())));
        }
         else {
           orders.add(new OrderSpecifier<>(dir, entityPath.getString(o.getProperty())));
        }
      }

      List<PlayerDto.Summary> result = query.orderBy(orders.toArray(new OrderSpecifier[]{})).fetch().stream().map(this::convertToSummary).toList();

      long total = jpaQueryFactory
          .select(player.count())
          .from(player)
          .where(stateCondition, nameCondition)
          .fetchOne();

      return new PageImpl<>(result, pageable, total);
    }

    @Transactional
    public void deletePlayer(Long id) {
        if (!playerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Player not found with id: " + id);
        }
        playerRepository.deleteById(id);
    }

    private PlayerDto.Response convertToResponse(Player player) {
        // 승/패 계산 로직 (간단히 구현)
        int wins = player.getWins().size();
        int losses = player.getLosses().size();

        return PlayerDto.Response.builder()
                .id(player.getId())
                .nickname(player.getNickname())
                .race(player.getRace())
                .grade(player.getGrade() != null ? convertGradeToSummary(player.getGrade()) : null)
                .clan(
                    player.getPlayerClans().isEmpty() ? null :
                    ClanDto.Summary.builder()
                        .id(
                            player.getPlayerClans().stream().findFirst().get().getClan().getId()
                        )
                        .name(
                            player.getPlayerClans().stream().findFirst().get().getClan().getName()
                        )
                        .memberCount(
                            player.getPlayerClans().stream().findFirst().get().getClan().getPlayerClan().size()
                        )
                        .build()
                )
                .status(player.getStatus())
                .createdAt(player.getCreatedAt())
                .updatedAt(player.getUpdatedAt())
                .totalMatches(wins + losses)
                .wins( wins)
                .losses(losses)
                .build();
    }

    private PlayerDto.Summary convertToSummary(Player player) {
      Optional<PlayerClan> pc = player.getPlayerClans().stream().filter(d -> d.getStatus().equals(EntityStatus.REGISTERED)).findFirst();
      ClanDto.Summary clanDto = ClanDto.Summary.builder().build();
      if (pc.isPresent()) {
        Clan c = pc.get().getClan();
        clanDto = ClanDto.Summary.builder()
            .id(c.getId())
            .name(c.getName())
            .memberCount(c.getPlayerClan().size())
            .status(c.getStatus())
            .build();
      }

        return PlayerDto.Summary.builder()
                .id(player.getId())
                .nickname(player.getNickname())
                .grade(player.getGrade() != null ? convertGradeToSummary(player.getGrade()) : null)
                .wins(player.getWins().size())
                .losses(player.getLosses().size())
                .race(player.getRace())
                .totalMatches(player.getWins().size() + player.getLosses().size())
                .clan(clanDto)
                .status(player.getStatus())
                .createdAt(player.getCreatedAt())
                .build();
    }

    private GradeDto.Summary convertGradeToSummary(Grade grade) {
        return GradeDto.Summary.builder()
                .id(grade.getId())
                .name(grade.getName())
                .status(grade.getStatus())
                .build();
    }
}
