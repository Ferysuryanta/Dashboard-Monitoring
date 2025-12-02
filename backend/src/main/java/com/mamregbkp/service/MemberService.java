package com.mamregbkp.service;

import com.mamregbkp.dto.MemberDto;
import com.mamregbkp.model.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public interface MemberService {
    MemberDto create(MemberDto dto);
    MemberDto getById(UUID id);
    Page<MemberDto> list(String search, String status, Pageable pageable);
    MemberDto update(java.util.UUID id, MemberDto dto);
    void delete(java.util.UUID id);
}
