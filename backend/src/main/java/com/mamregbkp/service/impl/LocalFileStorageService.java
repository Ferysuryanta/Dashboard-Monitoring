package com.mamregbkp.service.impl;

import com.mamregbkp.exception.BadRequestException;
import com.mamregbkp.exception.ResourceNotFoundException;
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
    public Path store(MultipartFile file, String subdir) {
        try {
            Path dir = root;
            if (subdir != null && !subdir.isEmpty()) {
                dir = root.resolve(subdir).normalize();
            }

            if (!dir.startsWith(root)) {
                throw new BadRequestException("Lokasi penyimpanan file tidak valid");
            }

            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            String ext = "";
            String original = file.getOriginalFilename();
            if (original != null && original.contains(".")) {
                ext = original.substring(original.lastIndexOf('.'));
            }

            String filename = UUID.randomUUID() + ext;
            Path target = dir.resolve(filename).normalize();
            Files.copy(file.getInputStream(), target);
            return root.relativize(target);
        } catch (IOException ex) {
            throw new BadRequestException("Gagal menyimpan file", ex);
        }
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            if (filename == null || filename.isBlank()) {
                throw new BadRequestException("Nama file tidak valid");
            }

            Path requestedPath = Paths.get(filename);
            Path filePath = requestedPath.isAbsolute()
                    ? requestedPath.normalize()
                    : root.resolve(requestedPath).normalize();

            if (!filePath.startsWith(root)) {
                throw new BadRequestException("Path file tidak valid");
            }

            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("File tidak ditemukan: " + filename);
            }

            return new FileSystemResource(filePath.toFile());
        } catch (BadRequestException | ResourceNotFoundException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Gagal membaca file", ex);
        }
    }
}

