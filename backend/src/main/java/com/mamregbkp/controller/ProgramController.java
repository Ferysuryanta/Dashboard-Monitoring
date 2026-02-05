package com.mamregbkp.controller;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.service.ProgramService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;

import com.mamregbkp.model.Program;
import com.mamregbkp.model.ProgramDocument;
import com.mamregbkp.repository.ProgramDocumentRepository;
import com.mamregbkp.service.FileStorageService;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {
    private final ProgramService svc;
    private final FileStorageService storage;
    private final ProgramDocumentRepository docRepo;

    public ProgramController(ProgramService svc, FileStorageService storage, ProgramDocumentRepository docRepo) { this.svc = svc; this.storage = storage; this.docRepo = docRepo; }

    @GetMapping
    public ResponseEntity<List<ProgramDto>> all() {
        return ResponseEntity.ok(svc.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDto> one(@PathVariable Long id) {
        ProgramDto dto = svc.findById(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ProgramDto> create(@RequestBody ProgramDto dto) {
        ProgramDto created = svc.create(dto);
        return ResponseEntity.created(URI.create("/api/programs/" + created.id)).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDto> update(@PathVariable Long id, @RequestBody ProgramDto dto) {
        ProgramDto updated = svc.update(id, dto);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Paged list + search
    @GetMapping(params = {"page","size"})
    public ResponseEntity<?> paged(@RequestParam int page, @RequestParam int size, @RequestParam(required = false) String q) {
        Page<?> p = ((com.mamregbkp.service.impl.ProgramServiceImpl)svc).findPaged(page, size, q);
        // map to DTOs
        List<ProgramDto> content = p.getContent().stream().map(obj -> {
            Program pr = (Program) obj;
            ProgramDto dto = new ProgramDto(); dto.id = pr.getId(); dto.title = pr.getTitle(); dto.description = pr.getDescription(); dto.type = pr.getType(); dto.status = pr.getStatus(); return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok().header("X-Total-Count", String.valueOf(p.getTotalElements())).body(content);
    }

    // Documents
    @PostMapping("/{id}/documents")
    public ResponseEntity<?> uploadDocument(@PathVariable Long id, @RequestParam("file") MultipartFile file) throws Exception {
        Path stored = storage.store(file, "programs/" + id);
        ProgramDocument doc = new ProgramDocument();
        doc.setProgramId(id);
        doc.setFilename(file.getOriginalFilename());
        doc.setStoragePath(stored.toString());
        doc.setMimeType(file.getContentType());
        doc.setUploadedAt(OffsetDateTime.now());
        ProgramDocument saved = docRepo.save(doc);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/documents")
    public ResponseEntity<List<ProgramDocument>> listDocs(@PathVariable Long id) {
        return ResponseEntity.ok(docRepo.findByProgramId(id));
    }

    @GetMapping("/documents/download/{docId}")
    public ResponseEntity<Resource> download(@PathVariable Long docId) throws Exception {
        ProgramDocument d = docRepo.findById(docId).orElse(null);
        if (d == null) return ResponseEntity.notFound().build();
        // load resource
        Resource res = storage.loadAsResource(Paths.get(d.getStoragePath()).getFileName().toString());
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(d.getMimeType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : d.getMimeType())).header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + d.getFilename() + "\"").body(res);
    }
}
