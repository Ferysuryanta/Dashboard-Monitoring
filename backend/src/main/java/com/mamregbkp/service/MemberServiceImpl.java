package com.mamregbkp.service;

import com.mamregbkp.dto.MemberDto;
import com.mamregbkp.model.Member;
import com.mamregbkp.model.Position;
import com.mamregbkp.model.Sector;
import com.mamregbkp.repository.MemberRepository;
import com.mamregbkp.repository.SectorRepository;
import com.mamregbkp.repository.PositionRepository;
import com.mamregbkp.exception.ResourceNotFoundException;
import com.mamregbkp.service.spec.MemberSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.UUID;

@Slf4j
@Service
public class MemberServiceImpl implements MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private PositionRepository positionRepository;

    private MemberDto toDto(Member m) {
        MemberDto d = new MemberDto();
        d.setId(m.getId());
        d.setFirstName(m.getFirstName());
        d.setLastName(m.getLastName());
        d.setGender(m.getGender());
        d.setBirthDate(m.getBirthDate());
        d.setPhone(m.getPhone());
        d.setEmail(m.getEmail());
        d.setAddress(m.getAddress());
        d.setStatus(m.getStatus());
        if (m.getSector() != null) {
            d.setSectorName(m.getSector().getName());
            d.setSectorId(m.getSector().getId());
        }
        if (m.getPosition() != null) d.setPositionName(m.getPosition().getName());
        d.setJoinedDate(m.getJoinedDate());

        // NEW: compute mamre/saitun by age using helper (keeps logic centralized)
        Boolean mamreFlag = null;
        Boolean saitunFlag = null;
        if (m.getBirthDate() != null) {
            try {
                AgeFlags f = flagsFromBirthDate(m.getBirthDate());
                mamreFlag = f.mamre;
                saitunFlag = f.saitun;
            } catch (Exception e) {
                // ignore and fallback to existing flags below
            }
        }

        // map new flags/codes
        // prefer computed flags; fallback to persisted boolean or kode fields
        boolean finalMamre = mamreFlag != null ? mamreFlag : (m.getMamre() != null ? m.getMamre() : (m.getKodeMamre() != null && "v".equalsIgnoreCase(m.getKodeMamre())));
        boolean finalSaitun = saitunFlag != null ? saitunFlag : (m.getSaitun() != null ? m.getSaitun() : (m.getKodeSaitun() != null && "v".equalsIgnoreCase(m.getKodeSaitun())));

        d.setMamre(finalMamre);
        d.setSaitun(finalSaitun);
        // keep kode fields as-is (may be null) for backward compatibility
        d.setKodeMamre(m.getKodeMamre());
        d.setKodeSaitun(m.getKodeSaitun());
        return d;
    }

    // pure helper: compute flags from a birthdate (no side-effects)
    private AgeFlags flagsFromBirthDate(LocalDate bd) {
        if (bd == null) return new AgeFlags(false, false);
        int age = Period.between(bd, LocalDate.now()).getYears();
        // rule: age > 60 => SAITUN, else MAMRE
        if (age > 60) return new AgeFlags(false, true);
        return new AgeFlags(true, false);
    }

    @Override
    @Transactional
    public MemberDto create(MemberDto dto) {
        log.debug("create() dto.birthDate={}", dto.getBirthDate());
        Member m = new Member();

        // central mapping + normalization
        applyDtoToEntity(m, dto, true);

        // resolve sector/position by name if provided
        if (dto.getSectorName() != null && !dto.getSectorName().isBlank()) {
            Sector sector = sectorRepository.findByNameIgnoreCase(dto.getSectorName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Sector not found: " + dto.getSectorName()));
            m.setSector(sector);
        }

        if (dto.getPositionName() != null && !dto.getPositionName().isBlank()) {
            Position p = positionRepository.findByNameIgnoreCase(dto.getPositionName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found: " + dto.getPositionName()));
            m.setPosition(p);
        }

        memberRepository.save(m);
        log.debug("created member id={}, birthDate={}", m.getId(), m.getBirthDate());
        dto.setId(m.getId());

        if (m.getSector() != null) dto.setSectorName(m.getSector().getName());
        if (m.getPosition() != null) dto.setPositionName(m.getPosition().getName());
        return dto;
    }

    @Override
    public MemberDto getById(UUID id) {
        Member m = memberRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        return toDto(m);
    }

    @Override
    public Page<MemberDto> list(String search, String status, Long sectorId, Pageable pageable) {
        Specification<Member> spec = Specification.allOf(
                MemberSpecification.search(search),
                MemberSpecification.filterStatus(status),
                MemberSpecification.filterSector(sectorId)
        );
        Page<Member> page = memberRepository.findAll(spec, pageable);
        return page.map(this::toDto);
    }

    @Override
    @Transactional
    public MemberDto update(UUID id, MemberDto dto) {
        log.debug("update() id={}, dto.birthDate={}", id, dto.getBirthDate());
        Member m = memberRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        log.debug("existing member id={}, birthDate={}", m.getId(), m.getBirthDate());

        applyDtoToEntity(m, dto, false);

        // resolve/clear sector and position according to DTO intent
        if (dto.getSectorName() != null) {
            if (!dto.getSectorName().isBlank()) {
                Sector sector = sectorRepository.findByNameIgnoreCase(dto.getSectorName().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Sector not found: " + dto.getSectorName()));
                m.setSector(sector);
            } else {
                m.setSector(null);
            }
        }

        if (dto.getPositionName() != null) {
            if (!dto.getPositionName().isBlank()) {
                Position p = positionRepository.findByNameIgnoreCase(dto.getPositionName().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("Position not found: " + dto.getPositionName()));
                m.setPosition(p);
            } else {
                m.setPosition(null);
            }
        }

        memberRepository.save(m);
        log.debug("saved member id={}, birthDate={}", m.getId(), m.getBirthDate());
        return toDto(m);
    }

    @Override
    public void delete(UUID id) {
        if (!memberRepository.existsById(id)) throw new ResourceNotFoundException("Member not found: " + id);
        memberRepository.deleteById(id);
    }

    // central mapping helper: apply non-null DTO fields to entity and handle flags/kode normalization
    private void applyDtoToEntity(Member m, MemberDto dto, boolean isNew) {
        if (dto.getFirstName() != null) m.setFirstName(dto.getFirstName().trim());
        else if (isNew && m.getFirstName() == null) m.setFirstName("");

        if (dto.getLastName() != null) m.setLastName(dto.getLastName().trim());
        if (dto.getGender() != null) m.setGender(dto.getGender());

        if (dto.getBirthDate() != null) m.setBirthDate(dto.getBirthDate());
        if (dto.getPhone() != null) m.setPhone(dto.getPhone().trim());
        if (dto.getEmail() != null) m.setEmail(dto.getEmail().trim());
        if (dto.getAddress() != null) m.setAddress(dto.getAddress().trim());

        // status: set default for new if not provided
        if (dto.getStatus() != null) m.setStatus(dto.getStatus());
        else if (isNew && m.getStatus() == null) m.setStatus("ACTIVE");

        if (dto.getJoinedDate() != null) m.setJoinedDate(dto.getJoinedDate());

        // kode fields normalization
        if (dto.getKodeMamre() != null) m.setKodeMamre(dto.getKodeMamre().trim());
        if (dto.getKodeSaitun() != null) m.setKodeSaitun(dto.getKodeSaitun().trim());

        // flags: explicit DTO values take precedence; if absent, compute from birthDate when available
        if (dto.getMamre() != null) m.setMamre(dto.getMamre());
        if (dto.getSaitun() != null) m.setSaitun(dto.getSaitun());
        if (dto.getMamre() == null && dto.getSaitun() == null) {
            if (m.getBirthDate() != null) {
                AgeFlags f = flagsFromBirthDate(m.getBirthDate());
                m.setMamre(f.mamre);
                m.setSaitun(f.saitun);
            }
        }
    }

    // small helper record for result
    private record AgeFlags(boolean mamre, boolean saitun) {
    }

}
