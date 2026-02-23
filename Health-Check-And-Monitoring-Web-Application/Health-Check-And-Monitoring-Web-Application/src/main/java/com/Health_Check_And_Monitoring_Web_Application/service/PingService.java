package com.Health_Check_And_Monitoring_Web_Application.service;

import com.Health_Check_And_Monitoring_Web_Application.model.PingHistoryEntity;
import com.Health_Check_And_Monitoring_Web_Application.repository.PingHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PingService {

    @Autowired
    private PingHistoryRepository pingHistoryRepository;

    public PingHistoryEntity ping(String name, String url) {
        long startTime = System.currentTimeMillis();
        String status;
        String message;

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestMethod("GET");
            conn.connect();
            int code = conn.getResponseCode();
            long responseTime = System.currentTimeMillis() - startTime;

            status = (code >= 200 && code < 400) ? "UP" : "DOWN";
            message = "HTTP " + code;

            return save(name, url, status, message, responseTime);
        } catch (Exception e) {
            long responseTime = System.currentTimeMillis() - startTime;
            return save(name, url, "DOWN", e.getMessage(), responseTime);
        }
    }

    private PingHistoryEntity save(String name, String url, String status, String message, long responseTime) {
        PingHistoryEntity entity = new PingHistoryEntity(
                name, url, status, message, responseTime, LocalDateTime.now()
        );
        return pingHistoryRepository.save(entity);
    }

    public List<PingHistoryEntity> getHistory() {
        return pingHistoryRepository.findAllByOrderByCheckedAtDesc();
    }
}