package com.suclan.suclan.service;

import com.suclan.suclan.domain.Contest;
import com.suclan.suclan.domain.Match;
import com.suclan.suclan.domain.Player;
import com.suclan.suclan.dto.ContestDto;
import com.suclan.suclan.dto.MatchDto;
import com.suclan.suclan.dto.PlayerDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.ContestRepository;
import com.suclan.suclan.repository.MatchRepository;
import com.suclan.suclan.repository.PlayerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContestService {

    private final ContestRepository contestRepository;
    private final MatchRepository matchRepository;
    private final PlayerRepository playerRepository;

    @Transactional
    public ContestDto.Response createContest(ContestDto.CreateRequest request) {
        Contest contest = Contest.builder()
                .name(request.getName())
                .description(request.getDescription())
                .startedAt(request.getStartedAt())
                .build();

        Contest savedContest = contestRepository.save(contest);
        return convertToResponse(savedContest);
    }

    @Transactional
    public ContestDto.Response updateContest(Long id, ContestDto.UpdateRequest request) {
        Contest contest = findContestById(id);

        if (request.getName() != null) {
            contest.setName(request.getName());
        }
        if (request.getDescription() != null) {
            contest.setDescription(request.getDescription());
        }
        if (request.getEndedAt() != null) {
            contest.setEndedAt(request.getEndedAt());
        }
        if (request.getStatus() != null) {
            contest.setStatus(request.getStatus());
        }

        Contest updatedContest = contestRepository.save(contest);
        return convertToResponse(updatedContest);
    }

    @Transactional
    public ContestDto.Response getContest(Long id) {
        Contest contest = findContestById(id);
        return convertToResponse(contest);
    }

    @Transactional
    public Page<ContestDto.Summary> getAllContests(Pageable pageable) {
        return contestRepository.findAll(pageable)
                .map(this::convertToSummary);
    }

    @Transactional
    public void deleteContest(Long id) {
        if (!contestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contest not found with id: " + id);
        }
        contestRepository.deleteById(id);
    }

    @Transactional
    public Contest findContestById(Long id) {
        return contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
    }

    private ContestDto.Response convertToResponse(Contest contest) {
        List<PlayerDto.Summary> participants = contest.getPlayers().stream()
                .map(this::convertPlayerToSummary)
                .collect(Collectors.toList());

        List<MatchDto.Summary> matches = contest.getMatches().stream()
                .map(this::convertMatchToSummary)
                .collect(Collectors.toList());

        return ContestDto.Response.builder()
                .id(contest.getId())
                .name(contest.getName())
                .description(contest.getDescription())
                .status(contest.getStatus())
                .startedAt(contest.getStartedAt())
                .endedAt(contest.getEndedAt())
                .createdAt(contest.getCreatedAt())
                .updatedAt(contest.getUpdatedAt())
                .participantCount(contest.getPlayers().size())
                .matchCount(contest.getMatches().size())
                .participants(participants)
                .matches(matches)
                .build();
    }

    private ContestDto.Summary convertToSummary(Contest contest) {
        return ContestDto.Summary.builder()
                .id(contest.getId())
                .name(contest.getName())
                .status(contest.getStatus())
                .startedAt(contest.getStartedAt())
                .endedAt(contest.getEndedAt())
                .participantCount(contest.getPlayers().size())
                .build();
    }

    private PlayerDto.Summary convertPlayerToSummary(Player player) {
        return PlayerDto.Summary.builder()
                .id(player.getId())
                .nickname(player.getNickname())
                .status(player.getStatus())
                .build();
    }

    private MatchDto.Summary convertMatchToSummary(Match match) {
        return MatchDto.Summary.builder()
                .id(match.getId())
                .playerOne(convertPlayerToSummary(match.getPlayerOne()))
                .playerTwo(convertPlayerToSummary(match.getPlayerTwo()))
                .winner(match.getWinner() != null ? convertPlayerToSummary(match.getWinner()) : null)
                .mapName(match.getMapName())
                .build();
    }
}
