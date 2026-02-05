package com.mamregbkp.service.impl;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.model.Program;
import com.mamregbkp.repository.ProgramRepository;
import com.mamregbkp.service.ProgramService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgramServiceImpl implements ProgramService {
    private final ProgramRepository repo;

    public ProgramServiceImpl(ProgramRepository repo) {
        this.repo = repo;
    }

    private ProgramDto toDto(Program p) {
        ProgramDto d = new ProgramDto();
        d.id = p.getId();
        d.title = p.getTitle();
        d.description = p.getDescription();
        d.type = p.getType();
        d.status = p.getStatus();
        return d;
    }

    private void applyDtoToEntity(Program p, ProgramDto d) {
        p.setTitle(d.title);
        p.setDescription(d.description);
        p.setType(d.type == null ? "Kegiatan" : d.type);
        p.setStatus(d.status == null ? "PLANNED" : d.status);
        p.setUpdatedAt(OffsetDateTime.now());
    }

    @Override
    public List<ProgramDto> findAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public ProgramDto findById(Long id) {
        return repo.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public ProgramDto create(ProgramDto dto) {
        Program p = new Program();
        applyDtoToEntity(p, dto);
        p.setCreatedAt(OffsetDateTime.now());
        p.setUpdatedAt(OffsetDateTime.now());
        Program saved = repo.save(p);
        return toDto(saved);
    }

    @Override
    public ProgramDto update(Long id, ProgramDto dto) {
        return repo.findById(id).map(existing -> {
            applyDtoToEntity(existing, dto);
            Program saved = repo.save(existing);
            return toDto(saved);
        }).orElse(null);
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }

    // New: paged + search
    public Page<Program> findPaged(int page, int size, String q) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (q == null || q.trim().isEmpty()) {
            return repo.findAll(pageable);
        }
        return repo.findByTitleContainingIgnoreCase(q, pageable);
    }
}
