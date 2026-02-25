package com.Health_Check_And_Monitoring_Web_Application.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_status_history")
public class ServiceStatusHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long serviceId;
    private String serviceName;
    private String url;
    private String status;

    @Column(length = 1000)
    private String errorMessage;

    private LocalDateTime eventTime;

    public ServiceStatusHistoryEntity() {}

    public ServiceStatusHistoryEntity(Long serviceId,
                                      String serviceName,
                                      String url,
                                      String status,
                                      String errorMessage,
                                      LocalDateTime eventTime) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.url = url;
        this.status = status;
        this.errorMessage = errorMessage;
        this.eventTime = eventTime;
    }

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getEventTime() { return eventTime; }
    public void setEventTime(LocalDateTime eventTime) { this.eventTime = eventTime; }
}