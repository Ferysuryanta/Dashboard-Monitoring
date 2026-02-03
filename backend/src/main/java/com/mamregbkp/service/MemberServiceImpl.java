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
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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
        // map new flags/codes
        d.setMamre(m.getMamre());
        d.setSaitun(m.getSaitun());
        d.setKodeMamre(m.getKodeMamre());
        d.setKodeSaitun(m.getKodeSaitun());
        return d;
    }

    @Override
    public MemberDto create(MemberDto dto) {
        Member m = new Member();
        m.setFirstName(dto.getFirstName());
        m.setLastName(dto.getLastName());
        m.setGender(dto.getGender());
        m.setBirthDate(dto.getBirthDate());
        m.setPhone(dto.getPhone());
        m.setEmail(dto.getEmail());
        m.setAddress(dto.getAddress());
        m.setStatus(dto.getStatus() == null ? "ACTIVE" : dto.getStatus());
        m.setJoinedDate(dto.getJoinedDate());

        // map new flags/codes
        if (dto.getMamre() != null) m.setMamre(dto.getMamre());
        if (dto.getSaitun() != null) m.setSaitun(dto.getSaitun());
        if (dto.getKodeMamre() != null) m.setKodeMamre(dto.getKodeMamre());
        if (dto.getKodeSaitun() != null) m.setKodeSaitun(dto.getKodeSaitun());

        if (dto.getSectorName() != null && !dto.getSectorName().isBlank()) {
            Sector sector = sectorRepository.findByNameIgnoreCase(dto.getSectorName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Sector not found: " +
                            dto.getSectorName()));
            m.setSector(sector);
        }

        if (dto.getPositionName() != null && !dto.getPositionName().isBlank()) {
            Position p = positionRepository.findByNameIgnoreCase(dto.getPositionName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found: " +
                            dto.getPositionName()));
            m.setPosition(p);
        }
        memberRepository.save(m);
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
    public MemberDto update(UUID id, MemberDto dto) {
        Member m = memberRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Member not found: " + id));
        if (dto.getFirstName() != null) m.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) m.setLastName(dto.getLastName());
        if (dto.getGender() != null) m.setGender(dto.getGender());
        if (dto.getBirthDate() != null) m.setBirthDate(dto.getBirthDate());
        if (dto.getPhone() != null) m.setPhone(dto.getPhone());
        if (dto.getEmail() != null) m.setEmail(dto.getEmail());
        if (dto.getAddress() != null) m.setAddress(dto.getAddress());
        if (dto.getStatus() != null) m.setStatus(dto.getStatus());
        if (dto.getJoinedDate() != null) m.setJoinedDate(dto.getJoinedDate());

        // map new flags/codes
        if (dto.getMamre() != null) m.setMamre(dto.getMamre());
        if (dto.getSaitun() != null) m.setSaitun(dto.getSaitun());
        if (dto.getKodeMamre() != null) m.setKodeMamre(dto.getKodeMamre());
        if (dto.getKodeSaitun() != null) m.setKodeSaitun(dto.getKodeSaitun());

        if (dto.getSectorName() != null && !dto.getSectorName().isBlank()) {
            Sector sector = sectorRepository.findByNameIgnoreCase(dto.getSectorName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Sector not found: " + dto.getSectorName()));
            m.setSector(sector);
        } else if (dto.getSectorName() == null) {
            m.setSector(null);
        }

        if (dto.getPositionName() != null && !dto.getPositionName().isBlank()) {
            Position p = positionRepository.findByNameIgnoreCase(dto.getPositionName().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Position not found: " + dto.getPositionName()));
            m.setPosition(p);
        } else if (dto.getPositionName() == null) {
            m.setPosition(null);
        }

        memberRepository.save(m);
        return toDto(m);
    }

    @Override
    public void delete(UUID id) {
        if (!memberRepository.existsById(id)) throw new ResourceNotFoundException("Member not found: " + id);
        memberRepository.deleteById(id);
    }

}
