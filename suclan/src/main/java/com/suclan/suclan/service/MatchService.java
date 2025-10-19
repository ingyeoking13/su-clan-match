package com.suclan.suclan.service;

import com.querydsl.core.types.Expression;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.*;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.constant.PlayerMatchSearchType;
import com.suclan.suclan.domain.Contest;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.domain.QMatch;
import com.suclan.suclan.dto.*;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.MatchRepository;
import com.suclan.suclan.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.config.YamlProcessor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

import static com.suclan.suclan.constant.EntityStatus.REGISTERED;
import static com.suclan.suclan.domain.QMatch.match;
import static com.suclan.suclan.domain.QPlayer.player;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ContestService contestService;
    private final JPAQueryFactory jpaQueryFactory;
    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public MatchDto.Response createMatch(MatchDto.CreateRequest request) {
        Player playerOne = playerRepository.findById(request.getPlayerOneId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + request.getPlayerOneId()));

        Player playerTwo = playerRepository.findById(request.getPlayerTwoId())
                .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + request.getPlayerTwoId()));

        Player winner = null;
        Player loser = null;
        if (request.getWinnerId() != null) {
            winner = playerRepository.findById(request.getWinnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Winner not found with id: " + request.getWinnerId()));
            loser = winner.getId().equals(playerOne.getId()) ? playerTwo : playerOne;
        }

        Match.MatchBuilder matchBuilder = Match.builder()
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .playerOneRace(playerOne.getRace())
                .playerTwoRace(playerTwo.getRace())
                .winner(winner)
                .loser(loser)
                .mapName(request.getMapName())
                .matchTime(request.getMatchTime())
                .streamingUrl(request.getStreamingUrl())
                .description(request.getDescription());

        if (request.getContestId() != null) {
            Contest contest = contestService.findContestById(request.getContestId());
            matchBuilder.contest(contest);
        }

        Match match = matchBuilder.build();
        Match savedMatch = matchRepository.save(match);
        return convertToResponse(savedMatch);
    }

    @Transactional
    public MatchDto.Response updateMatch(Long id, MatchDto.UpdateRequest request) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + id));

        if (request.getPlayerOneId() != null) {
          Player playerOne = playerRepository.findById(request.getPlayerOneId())
              .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + request.getPlayerOneId()));
          match.setPlayerOne(playerOne);
        }

        if (request.getPlayerTwoId() != null ) {
          Player playerTwo = playerRepository.findById(request.getPlayerTwoId())
              .orElseThrow(() -> new ResourceNotFoundException("Player not found with id: " + request.getPlayerTwoId()));
          match.setPlayerTwo(playerTwo);
        }

        if (request.getPlayerOneRace() != null) {
          match.setPlayerOneRace(request.getPlayerOneRace());
        }

        if (request.getPlayerTwoRace() != null) {
          match.setPlayerTwoRace(request.getPlayerTwoRace());
        }

        if (request.getWinnerId() != null) {
            Player winner = playerRepository.findById(request.getWinnerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Winner not found with id: " + request.getWinnerId()));
            match.setWinner(winner);
            
            // 승자가 아닌 플레이어가 패자
            Player loser = winner.getId().equals(match.getPlayerOne().getId()) ? 
                match.getPlayerTwo() : match.getPlayerOne();
            match.setLoser(loser);
        }
        if (request.getMapName() != null) {
            match.setMapName(request.getMapName());
        }
        if (request.getDescription() != null) {
            match.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            match.setStatus(request.getStatus());
        }
        if (request.getMatchTime() != null) {
            match.setMatchTime(request.getMatchTime());
        }
        if (request.getStreamingUrl() != null) {
            match.setStreamingUrl(request.getStreamingUrl());
        }

        Match updatedMatch = matchRepository.save(match);
        return convertToResponse(updatedMatch);
    }

    @Transactional
    public MatchDto.Response getMatch(Long id) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found with id: " + id));
        return convertToResponse(match);
    }

    @Transactional
    public Page<MatchDto.Summary> getAllMatches(Pageable pageable, MatchDto.SearchCondition condition) {

      BooleanExpression playerNameCondition = null;

      if (StringUtils.hasText(condition.getPlayerOneNickname())) {
        playerNameCondition = match.playerOne.nickname.likeIgnoreCase("%" + condition.getPlayerOneNickname() + "%")
            .or(match.playerTwo.nickname.likeIgnoreCase("%" + condition.getPlayerOneNickname() + "%"));
      }

      if (StringUtils.hasText(condition.getPlayerTwoNickname())) {
        BooleanExpression twoCond = match.playerOne.nickname.likeIgnoreCase("%" + condition.getPlayerTwoNickname() + "%")
            .or(match.playerTwo.nickname.likeIgnoreCase("%" + condition.getPlayerTwoNickname() + "%"));
        playerNameCondition = (playerNameCondition == null) ? twoCond : playerNameCondition.and(twoCond);
      }

      BooleanExpression deleteCondition = null;

      if (condition.isIncludeDeleted()){
        deleteCondition = match.status.in(REGISTERED, EntityStatus.DELETED);
      } else {
        deleteCondition = match.status.in(REGISTERED);
      }

      var query = jpaQueryFactory.selectFrom(match)
          .where(playerNameCondition, deleteCondition);

      List<OrderSpecifier<?>> orders = new ArrayList<>();
      for (Sort.Order o : pageable.getSort()) {
        PathBuilder<Match> entityPath = new PathBuilder<>(match.getType(), match.getMetadata());
        if (o.getProperty().equalsIgnoreCase("playerOneNickname")) {
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, match.playerOne.nickname));
        } else if (o.getProperty().equalsIgnoreCase("playerTwoNickname")) {
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, match.playerTwo.nickname));
        } else if (o.getProperty().equalsIgnoreCase("matchTime")) {
          if (o.isAscending()) {
            orders.add(match.matchTime.asc().nullsLast());
          } else {
            orders.add(match.matchTime.desc().nullsLast());
          }
        } else{
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, entityPath.getString(o.getProperty())));
        }
      }
      orders.add(new OrderSpecifier<>(Order.DESC, match.id));

     List<MatchDto.Summary> result = query.orderBy(
         orders.toArray(new OrderSpecifier[]{})
     ).offset(pageable.getOffset())
      .limit(pageable.getPageSize())
      .fetch().stream().map(
         this::convertToSummary
     ).toList();

      long total = jpaQueryFactory
          .select(match.count())
          .from(match)
          .where(playerNameCondition, deleteCondition)
          .fetchOne();

      return new PageImpl<>(result, pageable, total);
    }

    @Transactional
    public Page<MatchDto.Summary> getMatchesByPlayer(Long playerId, MatchDto.PlayerSpecificCondition condition, Pageable pageable) {
      if (condition.getMatchSearchType().equals(PlayerMatchSearchType.LATEST)) {
        return getMatchesByPlayerByLatest(playerId, condition, pageable);
      }

      Optional<Player> p = playerRepository.findByNickname(condition.getOpponentNickname());
      Page<OpponentSummary> queryResult = matchRepository.findOpponentSummaries(playerId, p.map(Player::getId).orElse(null), pageable);
      List<MatchDto.Summary> result  = queryResult.stream().map(
          tuple -> {
            Long opponentId = tuple.getOpponentId();
            PlayerDto.Summary oppponent = playerRepository.findById(opponentId).map(this::convertPlayerToSummary).get();
            return MatchDto.Summary.builder()
                .playerOne(playerRepository.findById(playerId).map(this::convertPlayerToSummary).get())
                .playerTwo(oppponent)
                .playerTwoRace(oppponent.getRace())
                .playerOneWins(tuple.getWin())
                .opponentWins(tuple.getLose())
                .build();
          }
      ).toList();
      return new PageImpl<>(result, pageable, queryResult.getTotalElements());
    }

    private Page<MatchDto.Summary> getMatchesByPlayerByLatest(Long playerId, MatchDto.PlayerSpecificCondition condition, Pageable pageable) {
      BooleanExpression whereCondition =
          match.playerOne.id.eq(playerId).or(match.playerTwo.id.eq(playerId));

      if (StringUtils.hasText(condition.getOpponentNickname())) {
        whereCondition.and(
            match.playerOne.nickname.likeIgnoreCase("%" + condition.getOpponentNickname() +"%")
                .or(match.playerTwo.nickname.likeIgnoreCase("%" + condition.getOpponentNickname() + "%"))
        );
      }

      if (StringUtils.hasText(condition.getMapName())) {
        whereCondition = whereCondition.and(match.mapName.likeIgnoreCase("%" + condition.getMapName() + "%"));
      }

      if (condition.getStartedAt() != null) {
        whereCondition = whereCondition.and(match.matchTime.goe(condition.getStartedAt()));
      }

      if (condition.getEndedAt() != null) {
        whereCondition = whereCondition.and(match.matchTime.loe(condition.getEndedAt()));
      }

      if (!condition.isIncludeDeleted()) {
        whereCondition = whereCondition.and(match.status.eq(REGISTERED));
      } else {
        whereCondition = whereCondition.and(match.status.in(REGISTERED, EntityStatus.DELETED));
      }

      List<MatchDto.Summary> result = jpaQueryFactory.selectFrom(match)
          .where(whereCondition)
          .offset(pageable.getOffset())
          .limit(pageable.getPageSize())
          .fetch()
          .stream().map(
              this::convertToSummary
          ).toList();

      long total = jpaQueryFactory
          .select(match.count())
          .from(match)
          .where(whereCondition)
          .fetchOne();

      return new PageImpl<>(result, pageable, total);
    }

    @Transactional
    public void deleteMatch(Long id) {
        if (!matchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Match not found with id: " + id);
        }
        matchRepository.deleteById(id);
    }

    private MatchDto.Response convertToResponse(Match match) {
        return MatchDto.Response.builder()
                .id(match.getId())
                .playerOne(convertPlayerToSummary(match.getPlayerOne()))
                .playerTwo(convertPlayerToSummary(match.getPlayerTwo()))
                .playerOneRace(match.getPlayerOneRace())
                .playerTwoRace(match.getPlayerTwoRace())
                .winner(match.getWinner() != null ? convertPlayerToSummary(match.getWinner()) : null)
                .loser(match.getLoser() != null ? convertPlayerToSummary(match.getLoser()) : null)
                .mapName(match.getMapName())
                .description(match.getDescription())
                .contest(match.getContest() != null ? convertContestToSummary(match.getContest()) : null)
                .streamingUrl(match.getStreamingUrl())
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
                .matchTime(match.getMatchTime())
                .build();
    }

    private MatchDto.Summary convertToSummary(Match match) {
        return MatchDto.Summary.builder()
                .id(match.getId())
                .playerOne(convertPlayerToSummary(match.getPlayerOne()))
                .playerTwo(convertPlayerToSummary(match.getPlayerTwo()))
                .playerOneRace(match.getPlayerOneRace())
                .playerTwoRace(match.getPlayerTwoRace())
                .winner(match.getWinner() != null ? convertPlayerToSummary(match.getWinner()) : null)
                .streamingUrl(match.getStreamingUrl())
                .mapName(match.getMapName())
                .matchTime(match.getMatchTime())
                .createdAt(match.getCreatedAt())
                .build();
    }

    private PlayerDto.Summary convertPlayerToSummary(Player player) {
        return PlayerDto.Summary.builder()
                .id(player.getId())
                .nickname(player.getNickname())
                .race(player.getRace())
                .grade(
                    GradeDto.Summary.builder()
                        .name(player.getGrade().getName())
                            .build())
//      AND (p2.nickname LIKE :oppo or p.nickname LIKE :oppo)
                .status(player.getStatus())
                .build();
    }

    private ContestDto.Summary convertContestToSummary(Contest contest) {
        return ContestDto.Summary.builder()
                .id(contest.getId())
                .name(contest.getName())
                .status(contest.getStatus())
                .startedAt(contest.getStartedAt())
                .endedAt(contest.getEndedAt())
                .participantCount(contest.getPlayers().size())
                .build();
    }
}
