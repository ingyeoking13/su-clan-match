package com.suclan.suclan.service;

import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suclan.suclan.domain.Contest;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.dto.ContestDto;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.MatchRepository;
import com.suclan.suclan.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

import static com.suclan.suclan.domain.QMatch.match;
import static com.suclan.suclan.domain.QPlayer.player;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ContestService contestService;
    private final JPAQueryFactory jpaQueryFactory;

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
        playerNameCondition = match.playerOne.nickname.like("%" + condition.getPlayerOneNickname() + "%")
            .or(match.playerTwo.nickname.like("%" + condition.getPlayerOneNickname() + "%"));
      }

      if (StringUtils.hasText(condition.getPlayerTwoNickname())) {
        BooleanExpression twoCond = match.playerOne.nickname.like("%" + condition.getPlayerTwoNickname() + "%")
            .or(match.playerTwo.nickname.like("%" + condition.getPlayerTwoNickname() + "%"));
        playerNameCondition = (playerNameCondition == null) ? twoCond : playerNameCondition.and(twoCond);
      }

      var query = jpaQueryFactory.selectFrom(match)
          .where(playerNameCondition)
          .offset(pageable.getOffset())
          .limit(pageable.getPageSize());

      List<OrderSpecifier<?>> orders = new ArrayList<>();
      for (Sort.Order o : pageable.getSort()) {
        PathBuilder<Match> entityPath = new PathBuilder<>(match.getType(), match.getMetadata());
        if (o.getProperty().equalsIgnoreCase("playerOneNickname")) {
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, match.playerOne.nickname));
        } else if (o.getProperty().equalsIgnoreCase("playerTwoNickname")) {
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, match.playerTwo.nickname));
        }
        else{
          orders.add(new OrderSpecifier<>(o.isAscending() ? Order.ASC : Order.DESC, entityPath.getString(o.getProperty())));
        }
      }

      List<MatchDto.Summary> result = query.orderBy(orders.toArray(new OrderSpecifier[]{})).fetch().stream().map(this::convertToSummary).toList();

      long total = jpaQueryFactory
          .select(match.count())
          .from(match)
          .where(playerNameCondition)
          .fetchOne();

      return new PageImpl<>(result, pageable, total);
    }

    @Transactional
    public Page<MatchDto.Summary> getMatchesByPlayer(Long playerId, Pageable pageable) {

      return matchRepository.findByPlayerOneIdOrPlayerTwoId(playerId, playerId, pageable)
                .map(this::convertToSummary);
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
                .winner(match.getWinner() != null ? convertPlayerToSummary(match.getWinner()) : null)
                .loser(match.getLoser() != null ? convertPlayerToSummary(match.getLoser()) : null)
                .mapName(match.getMapName())
                .description(match.getDescription())
                .contest(match.getContest() != null ? convertContestToSummary(match.getContest()) : null)
                .status(match.getStatus())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt())
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
                .mapName(match.getMapName())
                .createdAt(match.getCreatedAt())
                .build();
    }

    private PlayerDto.Summary convertPlayerToSummary(Player player) {
        return PlayerDto.Summary.builder()
                .id(player.getId())
                .nickname(player.getNickname())
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
