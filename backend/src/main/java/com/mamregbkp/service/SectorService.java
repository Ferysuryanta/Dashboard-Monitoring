package com.mamregbkp.service;

import com.mamregbkp.dto.SectorDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SectorService {
    SectorDto create(SectorDto dto);
    SectorDto update(Long id, SectorDto dto);
    void delete(Long id);
    SectorDto getById(Long id);
    Page<SectorDto> list(Pageable pageable);
}
