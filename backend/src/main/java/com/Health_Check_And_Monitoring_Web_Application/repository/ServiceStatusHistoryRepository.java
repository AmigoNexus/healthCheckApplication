package com.Health_Check_And_Monitoring_Web_Application.repository;

import com.Health_Check_And_Monitoring_Web_Application.model.ServiceStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceStatusHistoryRepository
        extends JpaRepository<ServiceStatusHistoryEntity, Long> {

    List<ServiceStatusHistoryEntity>
    findAllByServiceIdOrderByEventTimeDesc(Long serviceId);
}