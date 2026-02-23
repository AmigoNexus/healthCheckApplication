package com.Health_Check_And_Monitoring_Web_Application.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ping_history")
public class PingHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String url;
    private String status;
    private String message;
    private Long responseTime;
    private LocalDateTime checkedAt;

    public PingHistoryEntity() {
    }

    public PingHistoryEntity(String name, String url, String status, String message, Long responseTime, LocalDateTime checkedAt) {
        this.name = name;
        this.url = url;
        this.status = status;
        this.message = message;
        this.responseTime = responseTime;
        this.checkedAt = checkedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getResponseTime() {
        return responseTime;
    }

    public void setResponseTime(Long responseTime) {
        this.responseTime = responseTime;
    }

    public LocalDateTime getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(LocalDateTime checkedAt) {
        this.checkedAt = checkedAt;
    }
}