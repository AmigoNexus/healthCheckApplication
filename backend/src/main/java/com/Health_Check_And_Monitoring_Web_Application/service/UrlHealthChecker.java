package com.Health_Check_And_Monitoring_Web_Application.service;

import org.springframework.stereotype.Component;

import java.net.HttpURLConnection;
import java.net.URL;

@Component
public class UrlHealthChecker {

    public static class HealthCheckResult {
        private final String status;
        private final String errorMessage;

        public HealthCheckResult(String status, String errorMessage) {
            this.status = status;
            this.errorMessage = errorMessage;
        }

        public String getStatus() {
            return status;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    public HealthCheckResult check(String urlStr) {

        HttpURLConnection conn = null;

        try {
            conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestMethod("GET");
            conn.connect();

            int code = conn.getResponseCode();

            if (code >= 200 && code < 400) {
                return new HealthCheckResult("UP", null);
            } else {
                return new HealthCheckResult("DOWN", "HTTP Error Code: " + code);
            }

        } catch (Exception e) {
            return new HealthCheckResult("DOWN", e.getMessage());
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }
}