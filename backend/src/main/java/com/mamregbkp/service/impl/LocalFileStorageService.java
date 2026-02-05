package com.mamregbkp.service.impl;

import com.mamregbkp.service.FileStorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {
    private final Path root = Paths.get(System.getProperty("user.dir")).resolve("uploads");

    public LocalFileStorageService() throws IOException {
        if (!Files.exists(root)) Files.createDirectories(root);
    }

    @Override
    public Path store(MultipartFile file, String subdir) throws Exception {
        Path dir = root;
        if (subdir != null && !subdir.isEmpty()) dir = root.resolve(subdir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String filename = UUID.randomUUID().toString() + ext;
        Path target = dir.resolve(filename);
        Files.copy(file.getInputStream(), target);
        return target;
    }

    @Override
    public Resource loadAsResource(String filename) throws Exception {
        Path f = root.resolve(filename);
        if (!Files.exists(f)) throw new IOException("File not found: " + filename);
        return new FileSystemResource(f.toFile());
    }
}

