package com.mamregbkp.service;

import com.mamregbkp.dto.PositionDto;
import com.mamregbkp.model.Position;
import com.mamregbkp.repository.PositionRepository;
import com.mamregbkp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PositionServiceImpl implements PositionService {

    @Autowired
    private PositionRepository positionRepository;

    private PositionDto toDto(Position p) {
        PositionDto d = new PositionDto();
        d.setId(p.getId());
        d.setName(p.getName());
        d.setDescription(p.getDescription());
        return d;
    }

    @Override
    public PositionDto create(PositionDto dto) {
        Position p = new Position();
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        positionRepository.save(p);
        dto.setId(p.getId());
        return dto;
    }

    @Override
    public PositionDto update(Long id, PositionDto dto) {
        Position p = positionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Position not found: " + id));
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        positionRepository.save(p);
        return toDto(p);
    }

    @Override
    public void delete(Long id) {
        positionRepository.deleteById(id);
    }

    @Override
    public PositionDto getById(Long id) {
        Position p = positionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Position not found: " + id));
        return toDto(p);
    }

    @Override
    public Page<PositionDto> list(Pageable pageable) {
        return positionRepository.findAll(pageable).map(this::toDto);
    }
}
