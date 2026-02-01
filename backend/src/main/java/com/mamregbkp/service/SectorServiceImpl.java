package com.mamregbkp.service;

import com.mamregbkp.dto.SectorDto;
import com.mamregbkp.model.Sector;
import com.mamregbkp.repository.MemberRepository;
import com.mamregbkp.repository.SectorRepository;
import com.mamregbkp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SectorServiceImpl implements SectorService {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private MemberRepository memberRepository;

    private SectorDto toDto(Sector s) {
        SectorDto d = new SectorDto();
        d.setId(s.getId());
        d.setCode(s.getCode());
        d.setName(s.getName());
        d.setDescription(s.getDescription());
        d.setCreatedAt(s.getCreatedAt());
        d.setUpdatedAt(s.getUpdatedAt());
        return d;
    }

    @Override
    public SectorDto create(SectorDto dto) {
        Sector s = new Sector();
        s.setCode(dto.getCode());
        s.setName(dto.getName());
        s.setDescription(dto.getDescription());
        sectorRepository.save(s);
        dto.setId(s.getId());
        return dto;
    }

    @Override
    public SectorDto update(Long id, SectorDto dto) {
        Sector s = sectorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sector not found: " + id));
        s.setCode(dto.getCode());
        s.setName(dto.getName());
        s.setDescription(dto.getDescription());
        sectorRepository.save(s);
        return toDto(s);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // Check if sector exists
        if (!sectorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sector not found: " + id);
        }

        // Remove sector reference from all members using this sector
        memberRepository.findBySectorId(id).forEach(m -> {
            m.setSector(null);
            memberRepository.save(m);
        });

        sectorRepository.deleteById(id);
    }

    @Override
    public SectorDto getById(Long id) {
        Sector s = sectorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Sector not found: " + id));
        return toDto(s);
    }

    @Override
    public Page<SectorDto> list(Pageable pageable)  {
        return sectorRepository.findAll(pageable).map(this::toDto);
    }
}
