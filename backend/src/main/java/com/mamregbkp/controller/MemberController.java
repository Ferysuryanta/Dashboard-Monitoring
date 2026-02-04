package com.mamregbkp.controller;

import com.mamregbkp.dto.MemberDto;
import com.mamregbkp.service.MemberService;
import jakarta.validation.Valid;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;


@RestController
@RequestMapping(value = "/api/members", produces = MediaType.APPLICATION_JSON_VALUE)
public class MemberController {

    @Autowired
    private MemberService memberService;

    /**
     * Create member.
     * Returns 201 Created + Location header pointing to new resource.
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberDto> create(@Valid @RequestBody MemberDto dto) {
        MemberDto created = memberService.create(dto);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }


    @GetMapping("/{id}")
    public ResponseEntity<MemberDto> get(@PathVariable UUID id) {
        return ResponseEntity.ok(memberService.getById(id));
    }

    /**
     * List members with optional status filter.
     * Example: GET /api/members?page=0&size=20&status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<Page<MemberDto>> list(@RequestParam(required=false) String search,
                                                @RequestParam(required=false) String status,
                                                @RequestParam(required=false) Long sectorId,
                                                Pageable pageable) {
        return ResponseEntity.ok(memberService.list(search, status, sectorId, pageable));
    }

    /**
     * Export members (CSV streaming). Example: /api/members/export?sectorId=1
     */
    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody> exportCsv(
            @RequestParam(required=false) String status,
            @RequestParam(required=false) Long sectorId) {

        org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody stream = out -> {
            java.io.Writer writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(out, java.nio.charset.StandardCharsets.UTF_8));
            // CSV header
            writer.write("NO,NAMA,PENGGELAREN,TANGGAL_LAHIR,MAMRE,SAITUN,ALAMAT,NO_HP\n");

            int page = 0;
            int size = 500;
            Page<MemberDto> p;
            do {
                Pageable pageable = PageRequest.of(page, size);
                p = this.memberService.list(null, status, sectorId, pageable);
                for (MemberDto m : p) {
                    // write CSV line safely (escape double quotes)
                    String line = getLine(m);
                    writer.write(line);
                }
                writer.flush();
                page++;
            } while (p.hasNext());
            writer.flush();
        };

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("members_export.csv").build());
        headers.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
        return org.springframework.http.ResponseEntity.ok().headers(headers).body(stream);
    }

    private static @NonNull String getLine(MemberDto m) {
        String name = (m.getFirstName() == null ? "" : m.getFirstName()) + " " + (m.getLastName() == null ? "" : m.getLastName());
        String guardian = ""; // guardian not present in DTO; leave empty or map if exists
        String birth = m.getBirthDate() == null ? "" : m.getBirthDate().toString();
        String mamre = (m.getMamre() != null && m.getMamre()) ? "v" : "";
        String saitun = (m.getSaitun() != null && m.getSaitun()) ? "v" : "";
        String addr = m.getAddress() == null ? "" : m.getAddress().replace("\"", "\"\"");
        String phone = m.getPhone() == null ? "" : m.getPhone();
        return String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                "", name, guardian, birth, mamre, saitun, addr, phone);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MemberDto> update(@PathVariable UUID id, @Valid @RequestBody MemberDto dto) {
        MemberDto updated = memberService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
