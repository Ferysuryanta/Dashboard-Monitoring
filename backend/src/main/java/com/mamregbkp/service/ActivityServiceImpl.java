package com.mamregbkp.service;

import com.mamregbkp.dto.ActivityRequest;
import com.mamregbkp.model.Activity;
import com.mamregbkp.model.ActivityDocument;
import com.mamregbkp.repository.ActivityDocumentRepository;
import com.mamregbkp.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository repo;
    private final ActivityDocumentRepository docRepo;

    // configurable upload dir (ensure ends with '/')
    private final String UPLOAD_DIR = "uploads/activity/";

    @Override
    public Page<Activity> list(int page, int size, String search) {
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by("createdAt").descending());

        if (search != null && !search.trim().isEmpty()) {
            // repository should implement this method:
            // Page<Activity> findByTitleContainingIgnoreCase(String title, Pageable pageable);
            return repo.findByTitleContainingIgnoreCase(search.trim(), pageable);
        }

        return repo.findAll(pageable);
    }

    @Override
    public Activity get(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Activity not found"));
    }

    @Override
    public Activity create(ActivityRequest req) {
        Activity act = Activity.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .dateStart(req.getDateStart())
                .dateEnd(req.getDateEnd())
                .status(req.getStatus())
                .location(req.getLocation())
                .build();

        return repo.save(act);
    }

    @Override
    public Activity update(String id, ActivityRequest req) {
        Activity act = get(id);

        act.setTitle(req.getTitle());
        act.setDescription(req.getDescription());
        act.setDateStart(req.getDateStart());
        act.setDateEnd(req.getDateEnd());
        act.setStatus(req.getStatus());
        act.setLocation(req.getLocation());

        return repo.save(act);
    }

    @Override
    public void delete(String id) {
        Activity act = get(id);
        repo.delete(act);
    }

    @Override
    public Activity uploadDocument(String id, MultipartFile file) {
        Activity act = get(id);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            // ensure directory exists (create directories if not present)
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // sanitize original filename (very basic)
            String originalName = file.getOriginalFilename() == null ? "file" : Paths.get(file.getOriginalFilename()).getFileName().toString();

            // generate unique filename to avoid collisions
            String ext = "";
            int idx = originalName.lastIndexOf('.');
            if (idx > 0) ext = originalName.substring(idx);
            String filename = UUID.randomUUID().toString() + ext;

            Path target = uploadPath.resolve(filename);

            // save file to disk
            file.transferTo(target.toFile());

            // build accessible URL (adjust if you serve static files from different location)
            String url = "/" + UPLOAD_DIR + filename;

            ActivityDocument doc = ActivityDocument.builder()
                    .name(originalName)
                    .url(url)
                    .activity(act)
                    .build();

            ActivityDocument savedDoc = docRepo.save(doc);

            // ensure documents list initialized
            if (act.getDocuments() == null) {
                act.setDocuments(new java.util.ArrayList<>());
            }
            act.getDocuments().add(savedDoc);

            return repo.save(act);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}
