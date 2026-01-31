package com.mamregbkp.controller;

import com.mamregbkp.dto.PositionDto;
import com.mamregbkp.service.PositionService;
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
@RequestMapping(value = "/api/positions", produces = MediaType.APPLICATION_JSON_VALUE)
@Validated
public class PositionController {

    @Autowired
    private PositionService positionService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PositionDto> create(@Valid @RequestBody PositionDto dto) {
        PositionDto created = positionService.create(dto);

        // REST best practice: include Location header after creating a resource
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.getId())
                .toUri();

        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PositionDto> get(@PathVariable Long id) {
        PositionDto dto = positionService.getById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<Page<PositionDto>> list(Pageable pageable) {
        Page<PositionDto> page = positionService.list(pageable);
        return ResponseEntity.ok(page);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<PositionDto> update(@PathVariable Long id,
                                              @Valid @RequestBody PositionDto dto) {
        PositionDto updated = positionService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        positionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
