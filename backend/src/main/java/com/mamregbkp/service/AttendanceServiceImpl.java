package com.mamregbkp.service;

import com.mamregbkp.dto.AttendanceDto;
import com.mamregbkp.model.Attendance;
import com.mamregbkp.model.Member;
import com.mamregbkp.repository.AttendanceRepository;
import com.mamregbkp.repository.MemberRepository;
import com.mamregbkp.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private MemberRepository memberRepository;

    private AttendanceDto toDto(Attendance a) {
        AttendanceDto d = new AttendanceDto();
        d.setId(a.getId());
        // return memberName as "First Last" (nama lengkap)
        Member m = a.getMember();
        if (m != null) {
            String firstName = Optional.ofNullable(m.getFirstName()).orElse("");
            String lastName = Optional.ofNullable(m.getLastName()).orElse("");
            d.setMemberName((firstName + " " + lastName).trim());
            if (m.getSector() != null) {
                d.setSectorId(m.getSector().getId());
                d.setSectorName(m.getSector().getName());
            }
        }
        d.setAttendDate(a.getAttendDate());
        d.setEvent(a.getEvent());
        d.setPresent(a.isPresent());
        d.setKolpiAmount(a.getKolpiAmount());
        d.setNote(a.getNote());
        return d;
    }

    @Override
    public AttendanceDto create(AttendanceDto dto) {
        Member m = resolveMemberForDto(dto);

        Attendance a = new Attendance();
        a.setMember(m);
        a.setAttendDate(dto.getAttendDate());
        a.setEvent(dto.getEvent());
        a.setPresent(dto.getPresent() == null || dto.getPresent());
        a.setKolpiAmount(dto.getKolpiAmount());
        a.setNote(dto.getNote());
        attendanceRepository.save(a);
        dto.setId(a.getId());
        // echo resolved memberName back to client as full name
        if (m != null) {
            String firstName = Optional.ofNullable(m.getFirstName()).orElse("");
            String lastName = Optional.ofNullable(m.getLastName()).orElse("");
            dto.setMemberName((firstName + " " + lastName).trim());
        }
        return dto;
    }

    @Override
    public AttendanceDto update(Long id, AttendanceDto dto) {
        Attendance a = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found: " + id));

        // If DTO provides memberId or memberName, resolve and set new member
        if (dto.getMemberName() != null && !dto.getMemberName().isBlank()) {
            Member m = resolveMemberForDto(dto);
            a.setMember(m);
        }

        a.setAttendDate(dto.getAttendDate());
        a.setEvent(dto.getEvent());
        a.setPresent(dto.getPresent() == null || dto.getPresent());
        a.setKolpiAmount(dto.getKolpiAmount());
        a.setNote(dto.getNote());
        attendanceRepository.save(a);

        return toDto(a);
    }


    @Override
    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }

    @Override
    public AttendanceDto getById(Long id) {
        Attendance a = attendanceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Attendance not found: " + id));
        return toDto(a);
    }

    /**
     * List attendances with optional filtering.
     * 'member' parameter may be:
     *  - null: no member filter
     *  - a UUID string: filter by member id
     *  - a plain name or email: filter by resolved member(s) (partial/full/email)
     */
    @Override
    public Page<AttendanceDto> list(int page, int size, String member, LocalDate from, LocalDate to, Long sectorId, String sectorName) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "attendDate"));

        // Delegate filtering & pagination to repository (DB-side) for performance
        Page<Attendance> pageData = attendanceRepository.findByCriteria(
                (member == null || member.isBlank()) ? null : member.trim(),
                from,
                to,
                sectorId,
                (sectorName == null || sectorName.isBlank()) ? null : sectorName.trim(),
                pr
        );

        // Map to DTOs
        List<AttendanceDto> dtoList = pageData.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return new PageImpl<>(dtoList, pr, pageData.getTotalElements());
    }


    // ---------------- helper methods ----------------

    private Member resolveMemberForDto(AttendanceDto dto) {

        // then try memberName (email or name)
        String name = dto.getMemberName();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("memberId or memberName is required");
        }
        name = name.trim();

        // if looks like email
        if (name.contains("@")) {
            String finalName = name;
            return memberRepository.findByEmailIgnoreCase(name)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with email: " + finalName));
        }

        // if contains space -> try exact first+last
        String[] parts = name.split("\\s+");
        if (parts.length >= 2) {
            String first = parts[0];
            String last = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
            List<Member> exact = memberRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(first, last);
            if (exact.size() == 1) return exact.getFirst();
            if (exact.size() > 1) {
                throw new IllegalStateException("Multiple members found with name: " + name + ". Please be more specific (use email).");
            }
        }

        // partial search (first or last contains)
        List<Member> partial = memberRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name);
        if (partial.size() == 1) return partial.getFirst();
        if (partial.isEmpty()) throw new ResourceNotFoundException("Member not found with name or partial: " + name);

        // ambiguous
        throw new IllegalStateException("Multiple members matched for '" + name + "'. Please specify email or full name.");
    }

    private List<Member> resolveMembersByNameOrEmail(String q) {
        q = q.trim();
        if (q.contains("@")) {
            Optional<Member> byEmail = memberRepository.findByEmailIgnoreCase(q);
            return byEmail.map(Collections::singletonList).orElse(Collections.emptyList());
        }
        String[] parts = q.split("\\s+");
        if (parts.length >= 2) {
            String first = parts[0];
            String last = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
            List<Member> exact = memberRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(first, last);
            if (!exact.isEmpty()) return exact;
        }
        return memberRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(q, q);
    }

    private UUID tryParseUUID(String s) {
        try {
            return UUID.fromString(s);
        } catch (Exception ex) {
            return null;
        }
    }
}
