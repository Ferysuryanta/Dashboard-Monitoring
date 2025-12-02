package com.mamregbkp.controller;

import com.mamregbkp.dto.MemberDto;
import com.mamregbkp.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;


@RestController
@CrossOrigin(origins = "http://localhost:4200")
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
                                                Pageable pageable) {
        return ResponseEntity.ok(memberService.list(search, status, pageable));
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
