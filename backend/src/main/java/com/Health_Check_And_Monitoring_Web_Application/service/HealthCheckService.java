package com.Health_Check_And_Monitoring_Web_Application.service;

import com.Health_Check_And_Monitoring_Web_Application.model.ServiceEntity;
import com.Health_Check_And_Monitoring_Web_Application.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Service
public class HealthCheckService {

    @Autowired
    private ServiceRepository repo;

    @Autowired
    private EmailNotificationService emailService;

    private ThreadPoolTaskScheduler scheduler;

    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(10);
        scheduler.setThreadNamePrefix("health-check-");
        scheduler.initialize();
        loadScheduledTasks();
    }

    @PreDestroy
    public void destroy() {
        scheduledTasks.values().forEach(f -> f.cancel(false));
        scheduler.shutdown();
    }

    public String checkUrl(String urlStr) {
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(urlStr).openConnection();
            conn.setConnectTimeout(5000);
            conn.setReadTimeout(5000);
            conn.setRequestMethod("GET");
            conn.connect();
            int code = conn.getResponseCode();
            return (code >= 200 && code < 400) ? "UP" : "DOWN";
        } catch (Exception e) {
            System.err.println("❌ URL check failed for " + urlStr + ": " + e.getMessage());
            return "DOWN";
        }
    }

    public List<ServiceEntity> getAllStatuses() {
        return repo.findAll();
    }

    public ServiceEntity addService(ServiceEntity service) {
        String currentStatus = checkUrl(service.getUrl());
        service.setStatus(currentStatus);
        service.setLastChecked(LocalDateTime.now());
        updateNextCheckTime(service);

        ServiceEntity saved = repo.save(service);
        scheduleService(saved);
        return saved;
    }

    private void scheduleService(ServiceEntity service) {
        if (service.getCronExpression() == null || service.getCronExpression().isBlank()) {
            System.out.println("⚠️ No cron expression for service: " + service.getName());
            return;
        }

        try {
            CronExpression.parse(service.getCronExpression());
        } catch (Exception e) {
            System.err.println("❌ Invalid cron: " + service.getCronExpression());
            return;
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            ServiceEntity current = repo.findById(service.getId()).orElse(null);
            if (current == null) return;

            String previousStatus = current.getStatus();
            String newStatus = checkUrl(current.getUrl());
            LocalDateTime now = LocalDateTime.now();

            current.setStatus(newStatus);
            current.setLastChecked(now);
            updateNextCheckTime(current);
            repo.save(current);

            System.out.println("✅ Checked: " + current.getName() + " | Status: " + newStatus + " | " + now);

            if ("DOWN".equals(newStatus) && !"DOWN".equals(previousStatus)) {
                emailService.sendServiceDownAlert(
                        current.getName(),
                        current.getUrl(),
                        "Service is not responding"
                );
            } else if ("UP".equals(newStatus) && "DOWN".equals(previousStatus)) {
                emailService.sendServiceRecoveryAlert(
                        current.getName(),
                        current.getUrl()
                );
            }

        }, new CronTrigger(service.getCronExpression()));

        scheduledTasks.put(service.getId(), future);
    }

    private void updateNextCheckTime(ServiceEntity service) {
        try {
            if (service.getCronExpression() != null && !service.getCronExpression().isBlank()) {
                CronExpression cron = CronExpression.parse(service.getCronExpression());
                service.setNextCheck(cron.next(LocalDateTime.now()));
            }
        } catch (Exception e) {
            service.setNextCheck(null);
        }
    }

    private void loadScheduledTasks() {
        List<ServiceEntity> services = repo.findAll();
        System.out.println("📦 Loading " + services.size() + " scheduled services...");
        services.forEach(this::scheduleService);
    }

    public ServiceEntity updateCron(Long id, String newCron) {
        ServiceEntity service = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found: " + id));

        ScheduledFuture<?> existing = scheduledTasks.remove(id);
        if (existing != null) {
            existing.cancel(false);
        }

        service.setCronExpression(newCron);
        updateNextCheckTime(service);
        repo.save(service);

        scheduleService(service);
        return service;
    }

    public void deleteService(Long id) {
        ScheduledFuture<?> task = scheduledTasks.remove(id);
        if (task != null) task.cancel(false);
        repo.deleteById(id);
    }
}