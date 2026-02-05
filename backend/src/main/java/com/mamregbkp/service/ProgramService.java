package com.mamregbkp.service;

import com.mamregbkp.dto.ProgramDto;

import java.util.List;

public interface ProgramService {
    List<ProgramDto> findAll();
    ProgramDto findById(Long id);
    ProgramDto create(ProgramDto dto);
    ProgramDto update(Long id, ProgramDto dto);
    void delete(Long id);
}
