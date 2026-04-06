package com.mamregbkp.service;

import com.mamregbkp.dto.AttendanceDto;
import com.mamregbkp.exception.BadRequestException;
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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import com.mamregbkp.service.spec.AttendanceSpecification;

import java.time.LocalDate;
import java.util.*;

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
        Attendance saved = attendanceRepository.save(a);
        return toDto(saved);
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
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Data kehadiran tidak ditemukan: " + id);
        }
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
    @Transactional(readOnly = true)
    public Page<AttendanceDto> list(int page, int size, String member, LocalDate from, LocalDate to, Long sectorId, String sectorName) {
        validateListRequest(page, size, from, to);

        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "attendDate"));

        Specification<Attendance> spec = AttendanceSpecification.withFilters(
                (member == null || member.isBlank()) ? null : member.trim(),
                from,
                to,
                sectorId,
                (sectorName == null || sectorName.isBlank()) ? null : sectorName.trim()
        );

        Page<Attendance> pageData = attendanceRepository.findAll(spec, pr);

        List<AttendanceDto> dtoList = pageData.getContent().stream().map(this::toDto).toList();
        return new PageImpl<>(dtoList, pr, pageData.getTotalElements());
    }


    // ---------------- helper methods ----------------

    private Member resolveMemberForDto(AttendanceDto dto) {
        if (dto == null) {
            throw new BadRequestException("Data kehadiran wajib diisi");
        }

        String name = dto.getMemberName();
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Nama member wajib diisi");
        }
        name = name.trim();

        if (name.contains("@")) {
            String finalName = name;
            return memberRepository.findByEmailIgnoreCase(name)
                    .orElseThrow(() -> new ResourceNotFoundException("Member tidak ditemukan dengan email: " + finalName));
        }

        String[] parts = name.split("\\s+");
        if (parts.length >= 2) {
            String first = parts[0];
            String last = String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
            List<Member> exact = memberRepository.findByFirstNameIgnoreCaseAndLastNameIgnoreCase(first, last);
            if (exact.size() == 1) return exact.getFirst();
            if (exact.size() > 1) {
                throw new BadRequestException("Ditemukan lebih dari satu member dengan nama '" + name + "'. Gunakan email agar lebih spesifik.");
            }
        }

        List<Member> partial = memberRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name);
        if (partial.size() == 1) {
            return partial.getFirst();
        }
        if (partial.isEmpty()) {
            throw new ResourceNotFoundException("Member tidak ditemukan dengan nama: " + name);
        }

        throw new BadRequestException("Ditemukan lebih dari satu member untuk pencarian '" + name + "'. Gunakan email atau nama lengkap.");
    }

    private void validateListRequest(int page, int size, LocalDate from, LocalDate to) {
        if (page < 0) {
            throw new BadRequestException("Parameter page tidak boleh negatif");
        }

        if (size <= 0) {
            throw new BadRequestException("Parameter size harus lebih besar dari 0");
        }

        if (from != null && to != null && from.isAfter(to)) {
            throw new BadRequestException("Tanggal mulai tidak boleh lebih besar dari tanggal akhir");
        }
    }
}
