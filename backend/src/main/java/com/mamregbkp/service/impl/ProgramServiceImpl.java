package com.mamregbkp.service.impl;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.model.Program;
import com.mamregbkp.repository.ProgramRepository;
import com.mamregbkp.service.ProgramService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
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
        d.place = p.getPlace();
        d.purpose = p.getPurpose();
        d.targetPhysical = p.getTargetPhysical();
        d.budgetLocal = p.getBudgetLocal();
        d.budgetSubsidy = p.getBudgetSubsidy();
        d.budgetTotal = p.getBudgetTotal();
        d.executor = p.getExecutor();
        d.scheduleText = p.getScheduleText();
        d.notes = p.getNotes();
        d.category = p.getCategory();
        // nextSchedule left null for now (could be computed from scheduleText)
        return d;
    }

    private void applyDtoToEntity(Program p, ProgramDto d) {
        p.setTitle(d.title);
        p.setDescription(d.description);
        p.setType(d.type == null ? "Kegiatan" : d.type);
        p.setStatus(d.status == null ? "PLANNED" : d.status);
        p.setPlace(d.place);
        p.setPurpose(d.purpose);
        p.setTargetPhysical(d.targetPhysical);
        p.setBudgetLocal(d.budgetLocal);
        p.setBudgetSubsidy(d.budgetSubsidy);
        p.setBudgetTotal(d.budgetTotal);
        p.setExecutor(d.executor);
        p.setScheduleText(d.scheduleText);
        p.setNotes(d.notes);
        p.setCategory(d.category);
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

    // New: paged + search + filters using Specification
    @Override
    public Page<ProgramDto> findPaged(int page, int size, String q, String status, String type, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Program> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            if (q != null && !q.trim().isEmpty()) {
                String like = "%" + q.toLowerCase() + "%";
                try { preds.add(cb.like(cb.lower(root.get("title")), like)); } catch (Exception ignored) {}
                try { preds.add(cb.like(cb.lower(root.get("description")), like)); } catch (Exception ignored) {}
            }
            if (status != null && !status.trim().isEmpty()) {
                preds.add(cb.equal(root.get("status"), status));
            }
            if (type != null && !type.trim().isEmpty()) {
                preds.add(cb.equal(root.get("type"), type));
            }
            if (category != null && !category.trim().isEmpty()) {
                preds.add(cb.equal(root.get("category"), category));
            }
            if (preds.isEmpty()) return cb.conjunction();
            return cb.and(preds.toArray(new Predicate[0]));
        };

        Page<Program> pageResult = repo.findAll(spec, pageable);
        List<ProgramDto> dtos = pageResult.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, pageResult.getTotalElements());
    }
}
