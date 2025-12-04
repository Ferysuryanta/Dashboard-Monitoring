package com.mamregbkp.controller;

import com.mamregbkp.dto.ActivityRequest;
import com.mamregbkp.model.Activity;
import com.mamregbkp.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ActivityController {

    private final ActivityService activityService;

    /**
     * List activities with paging and optional search.
     * Example: GET /api/activities?page=0&size=20&search=rohani
     */
    @GetMapping
    public ResponseEntity<Page<Activity>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        Page<Activity> result = activityService.list(page, size, search);
        return ResponseEntity.ok(result);
    }

    /**
     * Get single activity
     */
    @GetMapping("/{id}")
    public ResponseEntity<Activity> get(@PathVariable String id) {
        Activity a = activityService.get(id);
        return ResponseEntity.ok(a);
    }

    /**
     * Create activity
     */
    @PostMapping
    public ResponseEntity<Activity> create(@RequestBody ActivityRequest request) {
        Activity created = activityService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update activity
     */
    @PutMapping("/{id}")
    public ResponseEntity<Activity> update(@PathVariable String id, @RequestBody ActivityRequest request) {
        Activity updated = activityService.update(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete activity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Upload one document for activity (multipart/form-data)
     * Form field name: file
     */
    @PostMapping("/{id}/documents")
    public ResponseEntity<Activity> uploadDocument(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) {
        Activity updated = activityService.uploadDocument(id, file);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a document from an activity (file + DB)
     */
//    @DeleteMapping("/{id}/documents/{docId}")
//    public ResponseEntity<Void> deleteDocument(
//            @PathVariable("id") String activityId,
//            @PathVariable("docId") String documentId
//    ) {
//        // if your service has method deleteDocument
//        activityService.deleteDocument(activityId, documentId);
//        return ResponseEntity.noContent().build();
//    }
}
