package com.suclan.suclan.service;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.suclan.suclan.constant.EntityStatus;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.dto.MainDto;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.dto.PlayerDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.suclan.suclan.domain.QClan.clan;
import static com.suclan.suclan.domain.QMatch.match;
import static com.suclan.suclan.domain.QPlayer.player;

@Service
@RequiredArgsConstructor
@Slf4j
public class MainFacade {

  public final JPAQueryFactory jpaQueryFactory;

  @Transactional
  public MainDto.Summary getSummary() {


    Long clanCount = jpaQueryFactory.selectFrom( clan ).where(clan.status.eq(EntityStatus.REGISTERED)).select(clan.count()).fetchFirst();
    Long memberCount = jpaQueryFactory.selectFrom( player ).where(player.status.eq(EntityStatus.REGISTERED)).select( player.count() ).fetchFirst();
    Long matchCount = jpaQueryFactory.selectFrom( match ).where(match.status.eq(EntityStatus.REGISTERED)).select( match.count() ).fetchFirst();
    List<Match> matchList =  jpaQueryFactory.selectFrom( match ).where(match.status.eq(EntityStatus.REGISTERED)).orderBy(match.matchTime.desc().nullsLast()).limit(10).fetch();

    return MainDto.Summary.builder()
        .clanCount(clanCount)
        .memberCount(memberCount)
        .matchCount(matchCount)
        .matches(matchList.stream().map(this::convertToSummary).toList())
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
        .status(player.getStatus())
        .build();
  }
}