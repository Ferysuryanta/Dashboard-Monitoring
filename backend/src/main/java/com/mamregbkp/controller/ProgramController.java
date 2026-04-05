package com.mamregbkp.controller;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.exception.ResourceNotFoundException;
import com.mamregbkp.service.ProgramService;
import com.mamregbkp.repository.ProgramRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;

import com.mamregbkp.model.ProgramDocument;
import com.mamregbkp.repository.ProgramDocumentRepository;
import com.mamregbkp.service.FileStorageService;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {
    private final ProgramService svc;
    private final FileStorageService storage;
    private final ProgramDocumentRepository docRepo;
    private final ProgramRepository programRepo;

    public ProgramController(ProgramService svc, FileStorageService storage, ProgramDocumentRepository docRepo, ProgramRepository programRepo) { this.svc = svc; this.storage = storage; this.docRepo = docRepo; this.programRepo = programRepo; }

    @GetMapping
    public ResponseEntity<List<ProgramDto>> all() {
        return ResponseEntity.ok(svc.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> categories() {
        return ResponseEntity.ok(programRepo.findDistinctCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProgramDto> one(@PathVariable Long id) {
        return ResponseEntity.ok(svc.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProgramDto> create(@RequestBody ProgramDto dto) {
        ProgramDto created = svc.create(dto);
        return ResponseEntity.created(URI.create("/api/programs/" + created.id)).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgramDto> update(@PathVariable Long id, @RequestBody ProgramDto dto) {
        return ResponseEntity.ok(svc.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        svc.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Paged list + search
    @GetMapping(params = {"page","size"})
    public ResponseEntity<?> paged(@RequestParam int page, @RequestParam int size, @RequestParam(required = false) String q, @RequestParam(required = false) String status, @RequestParam(required = false) String type, @RequestParam(required = false) String category) {
        Page<ProgramDto> p = svc.findPaged(page, size, q, status, type, category);
        return ResponseEntity.ok().header("X-Total-Count", String.valueOf(p.getTotalElements())).body(p.getContent());
    }

    // Documents
    @PostMapping("/{id}/documents")
    public ResponseEntity<ProgramDocument> uploadDocument(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        svc.findById(id);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File dokumen wajib diunggah");
        }

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
        svc.findById(id);
        return ResponseEntity.ok(docRepo.findByProgramId(id));
    }

    @GetMapping("/documents/download/{docId}")
    public ResponseEntity<Resource> download(@PathVariable Long docId) {
        ProgramDocument d = docRepo.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Dokumen program tidak ditemukan: " + docId));

        Resource res = storage.loadAsResource(Paths.get(d.getStoragePath()).getFileName().toString());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(d.getMimeType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : d.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + d.getFilename() + "\"")
                .body(res);
    }
}
