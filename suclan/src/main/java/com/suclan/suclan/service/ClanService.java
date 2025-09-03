package com.suclan.suclan.service;

import com.suclan.suclan.domain.Clan;
import com.suclan.suclan.dto.ClanDto;
import com.suclan.suclan.exception.ResourceNotFoundException;
import com.suclan.suclan.repository.ClanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClanService {

    private final ClanRepository clanRepository;

    @Transactional
    public ClanDto.Response createClan(ClanDto.CreateRequest request) {
        Clan clan = Clan.builder()
                .name(request.getName())
                .description(request.getDescription())
                .foundingDate(request.getFoundingDate())
                .build();

        Clan savedClan = clanRepository.save(clan);
        return convertToResponse(savedClan);
    }

    @Transactional
    public ClanDto.Response updateClan(Long id, ClanDto.UpdateRequest request) {
        Clan clan = clanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clan not found with id: " + id));

        if (request.getName() != null) {
            clan.setName(request.getName());
        }
        if (request.getDescription() != null) {
            clan.setDescription(request.getDescription());
        }
        if (request.getClosingDate() != null) {
            clan.setClosingDate(request.getClosingDate());
        }
        if (request.getStatus() != null) {
            clan.setStatus(request.getStatus());
        }

        Clan updatedClan = clanRepository.save(clan);
        return convertToResponse(updatedClan);
    }

    @Transactional
    public ClanDto.Response getClan(Long id) {
        Clan clan = clanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clan not found with id: " + id));
        return convertToResponse(clan);
    }

    @Transactional
    public Page<ClanDto.Summary> getAllClans(Pageable pageable) {
      return clanRepository.findAll(pageable)
            .map(this::convertToSummary);
    }

    @Transactional
    public void deleteClan(Long id) {
        if (!clanRepository.existsById(id)) {
            throw new ResourceNotFoundException("Clan not found with id: " + id);
        }
        clanRepository.deleteById(id);
    }

    private ClanDto.Response convertToResponse(Clan clan) {
        return ClanDto.Response.builder()
                .id(clan.getId())
                .name(clan.getName())
                .description(clan.getDescription())
                .foundingDate(clan.getFoundingDate())
                .closingDate(clan.getClosingDate())
                .status(clan.getStatus())
                .createdAt(clan.getCreatedAt())
                .updatedAt(clan.getUpdatedAt())
                .memberCount(clan.getPlayerClan().size())
                .build();
    }

    private ClanDto.Summary convertToSummary(Clan clan) {
        return ClanDto.Summary.builder()
                .id(clan.getId())
                .name(clan.getName())
                .status(clan.getStatus())
                .memberCount(clan.getPlayerClan().size())
                .foundingDate(clan.getFoundingDate())
                .build();
    }
}
