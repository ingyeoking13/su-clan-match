package com.suclan.suclan.service;

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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;
    private final ContestService contestService;

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
            
            // 승자가 아닌 플레이어가 패자
            loser = winner.getId().equals(playerOne.getId()) ? playerTwo : playerOne;
        }

        Match.MatchBuilder matchBuilder = Match.builder()
                .playerOne(playerOne)
                .playerTwo(playerTwo)
                .winner(winner)
                .loser(loser)
                .mapName(request.getMapName())
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
    public Page<MatchDto.Summary> getAllMatches(Pageable pageable) {
        return matchRepository.findAll(pageable)
                .map(this::convertToSummary);
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
