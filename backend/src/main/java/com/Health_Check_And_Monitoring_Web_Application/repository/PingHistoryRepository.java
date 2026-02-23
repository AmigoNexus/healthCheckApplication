package com.Health_Check_And_Monitoring_Web_Application.repository;

import com.Health_Check_And_Monitoring_Web_Application.model.PingHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PingHistoryRepository extends JpaRepository<PingHistoryEntity, Long> {
    List<PingHistoryEntity> findAllByOrderByCheckedAtDesc();
}