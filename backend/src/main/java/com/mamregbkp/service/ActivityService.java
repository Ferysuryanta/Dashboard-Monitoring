package com.mamregbkp.service;

import com.mamregbkp.dto.ActivityRequest;
import com.mamregbkp.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface ActivityService {

    Page<Activity> list(int page, int size, String search);
    Activity get(String id);
    Activity create(ActivityRequest request);
    Activity update(String id, ActivityRequest request);
    void delete(String id);
    Activity uploadDocument(String id, MultipartFile file);
}
