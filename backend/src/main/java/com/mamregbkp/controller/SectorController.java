package com.mamregbkp.controller;

import com.mamregbkp.dto.SectorDto;
import com.mamregbkp.service.SectorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping(value = "/api/sectors", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class SectorController {

    @Autowired
    private SectorService sectorService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SectorDto> create(@Valid @RequestBody SectorDto dto) {
        SectorDto created = sectorService.create(dto);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectorDto> get(@PathVariable Long id) {
        SectorDto dto = sectorService.getById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<Page<SectorDto>>
            list(Pageable pageable)  {

        Page<SectorDto> data = sectorService.list(pageable);
        return ResponseEntity.ok(data);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SectorDto> update(@PathVariable Long id, @Valid @RequestBody SectorDto dto) {
        SectorDto updated = sectorService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sectorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}