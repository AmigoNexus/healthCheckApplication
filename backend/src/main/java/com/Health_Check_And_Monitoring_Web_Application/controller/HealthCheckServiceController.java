package com.Health_Check_And_Monitoring_Web_Application.controller;

import com.Health_Check_And_Monitoring_Web_Application.model.ServiceEntity;
import com.Health_Check_And_Monitoring_Web_Application.service.HealthCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service")
public class HealthCheckServiceController {

    @Autowired
    private HealthCheckService healthService;

    @GetMapping("/status/all")
    public ResponseEntity<List<ServiceEntity>> getAllStatuses() {
        return ResponseEntity.ok(healthService.getAllStatuses());
    }

    @PostMapping("/add")
    public ResponseEntity<ServiceEntity> addService(@RequestBody ServiceEntity service) {
        return ResponseEntity.ok(healthService.addService(service));
    }

    @PutMapping("/update-cron/{id}")
    public ResponseEntity<ServiceEntity> updateCron(
            @PathVariable Long id,
            @RequestParam String cron) {
        return ResponseEntity.ok(healthService.updateCron(id, cron));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        healthService.deleteService(id);
        return ResponseEntity.noContent().build();
    }
}