package com.mamregbkp.repository;

import com.mamregbkp.model.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRepository extends JpaRepository<Activity, String> {

    Page<Activity> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
