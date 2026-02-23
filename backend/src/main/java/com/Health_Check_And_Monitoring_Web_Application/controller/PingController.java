package com.Health_Check_And_Monitoring_Web_Application.controller;

import com.Health_Check_And_Monitoring_Web_Application.model.PingHistoryEntity;
import com.Health_Check_And_Monitoring_Web_Application.service.PingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${cors.allowed-origin:http://localhost:5173}")
public class PingController {

    @Autowired
    private PingService pingService;

    @PostMapping("/ping")
    public ResponseEntity<PingHistoryEntity> pingService(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String url = request.get("url");

        if (name == null || url == null || url.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        PingHistoryEntity result = pingService.ping(name, url);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/ping-history")
    public ResponseEntity<List<PingHistoryEntity>> getPingHistory() {
        return ResponseEntity.ok(pingService.getHistory());
    }
}