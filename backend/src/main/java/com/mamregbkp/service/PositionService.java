package com.mamregbkp.service;

import com.mamregbkp.dto.PositionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PositionService {
    PositionDto create(PositionDto dto);
    PositionDto update(Long id, PositionDto dto);
    void delete(Long id);
    PositionDto getById(Long id);
    Page<PositionDto> list(Pageable pageable);
}
