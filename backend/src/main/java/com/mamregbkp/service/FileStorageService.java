package com.mamregbkp.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {
    Path store(MultipartFile file, String subdir) throws Exception;
    Resource loadAsResource(String filename) throws Exception;
}
