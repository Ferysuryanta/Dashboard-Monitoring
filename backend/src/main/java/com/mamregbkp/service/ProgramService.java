package com.mamregbkp.service;

import com.mamregbkp.dto.ProgramDto;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProgramService {
    List<ProgramDto> findAll();
    ProgramDto findById(Long id);
    ProgramDto create(ProgramDto dto);
    ProgramDto update(Long id, ProgramDto dto);
    void delete(Long id);

    // paged + search/filter
    Page<ProgramDto> findPaged(int page, int size, String q, String status, String type, String category);
}
