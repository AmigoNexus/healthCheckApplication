package com.Health_Check_And_Monitoring_Web_Application.repository;

import com.Health_Check_And_Monitoring_Web_Application.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {}