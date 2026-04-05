package com.mamregbkp.service.impl;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.exception.ResourceNotFoundException;
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
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Program tidak ditemukan: " + id));
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
        Program existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program tidak ditemukan: " + id));

        applyDtoToEntity(existing, dto);
        Program saved = repo.save(existing);
        return toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Program tidak ditemukan: " + id);
        }
        repo.deleteById(id);
    }

    // New: paged + search + filters using Specification
    @Override
    public Page<ProgramDto> findPaged(int page, int size, String q, String status, String type, String category) {
        log.info("findPaged called with page={}, size={}, q={}, status={}, type={}, category={}", page, size, q, status, type, category);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Specification<Program> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();

            // build q predicates (title OR description)
            if (q != null && !q.trim().isEmpty()) {
                String like = "%" + q.toLowerCase() + "%";
                List<Predicate> qPreds = new ArrayList<>();
                try { qPreds.add(cb.like(cb.lower(root.get("title")), like)); } catch (Exception ignored) {}
                try { qPreds.add(cb.like(cb.lower(root.get("description")), like)); } catch (Exception ignored) {}
                if (!qPreds.isEmpty()) {
                    preds.add(cb.or(qPreds.toArray(new Predicate[0])));
                }
            }

            if (status != null && !status.trim().isEmpty()) {
                String sTrim = status.trim();
                if (!sTrim.equalsIgnoreCase("semua") && !sTrim.equalsIgnoreCase("all")) {
                    // case-insensitive match
                    preds.add(cb.equal(cb.lower(root.get("status")), sTrim.toLowerCase()));
                }
            }
            if (type != null && !type.trim().isEmpty()) {
                String tTrim = type.trim();
                if (!tTrim.equalsIgnoreCase("semua") && !tTrim.equalsIgnoreCase("all")) {
                    // case-insensitive match
                    preds.add(cb.equal(cb.lower(root.get("type")), tTrim.toLowerCase()));
                }
            }
            if (category != null && !category.trim().isEmpty()) {
                String trimmed = category.trim();
                if (!trimmed.equalsIgnoreCase("semua") && !trimmed.equalsIgnoreCase("all")) {
                    // allow matching by prefix before ' - ' as frontend may send 'A - BIDANG ...'
                    String beforeDash = trimmed.split(" - ")[0].trim();
                    String catCode = !beforeDash.isEmpty() ? beforeDash : String.valueOf(trimmed.charAt(0));
                    // compare lower-case for robustness
                    try {
                        preds.add(cb.or(cb.equal(cb.lower(root.get("category")), trimmed.toLowerCase()), cb.equal(cb.lower(root.get("category")), catCode.toLowerCase())));
                    } catch (Exception ignored) {
                        // fallback to exact match
                        preds.add(cb.equal(cb.lower(root.get("category")), trimmed.toLowerCase()));
                    }
                }
            }
            if (preds.isEmpty()) return cb.conjunction();
            return cb.and(preds.toArray(new Predicate[0]));
        };

        Page<Program> pageResult = repo.findAll(spec, pageable);
        List<ProgramDto> dtos = pageResult.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, pageResult.getTotalElements());
    }
}
