package com.Health_Check_And_Monitoring_Web_Application.service;

import com.Health_Check_And_Monitoring_Web_Application.model.ServiceEntity;
import com.Health_Check_And_Monitoring_Web_Application.model.ServiceStatusHistoryEntity;
import com.Health_Check_And_Monitoring_Web_Application.repository.ServiceRepository;
import com.Health_Check_And_Monitoring_Web_Application.repository.ServiceStatusHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
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

    @Autowired
    private ThreadPoolTaskScheduler scheduler;

    @Autowired
    private UrlHealthChecker healthChecker;

    @Autowired
    private ServiceStatusHistoryRepository historyRepo;

    private final Map<Long, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();

    @PostConstruct
    public void loadScheduledTasks() {
        List<ServiceEntity> services = repo.findAll();
        services.forEach(this::scheduleService);
    }

    @PreDestroy
    public void shutdown() {
        scheduledTasks.values().forEach(f -> f.cancel(false));
    }

    public List<ServiceEntity> getAllStatuses() {
        return repo.findAll();
    }

    public ServiceEntity addService(ServiceEntity service) {

        validateCron(service.getCronExpression());

        UrlHealthChecker.HealthCheckResult result =
                healthChecker.check(service.getUrl());

        service.setStatus(result.getStatus());
        service.setLastChecked(LocalDateTime.now());
        updateNextCheckTime(service);

        ServiceEntity saved = repo.save(service);
        scheduleService(saved);
        return saved;
    }

    public ServiceEntity updateCron(Long id, String newCron) {

        validateCron(newCron);

        ServiceEntity service = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

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

    private void scheduleService(ServiceEntity service) {

        if (service.getCronExpression() == null || service.getCronExpression().isBlank()) {
            return;
        }

        ScheduledFuture<?> future = scheduler.schedule(() -> {

            ServiceEntity current = repo.findById(service.getId()).orElse(null);
            if (current == null) return;

            String previousStatus = current.getStatus();

            UrlHealthChecker.HealthCheckResult result =
                    healthChecker.check(current.getUrl());

            String newStatus = result.getStatus();
            String errorMessage = result.getErrorMessage();

            current.setStatus(newStatus);
            current.setLastChecked(LocalDateTime.now());
            updateNextCheckTime(current);
            repo.save(current);

            if (!newStatus.equals(previousStatus)) {

                ServiceStatusHistoryEntity history =
                        new ServiceStatusHistoryEntity(
                                current.getId(),
                                current.getName(),
                                current.getUrl(),
                                newStatus,
                                errorMessage,
                                LocalDateTime.now()
                        );

                historyRepo.save(history);

                if ("DOWN".equals(newStatus)) {
                    emailService.sendServiceDownAlert(
                            current.getName(),
                            current.getUrl(),
                            errorMessage
                    );
                }

                if ("UP".equals(newStatus)) {
                    emailService.sendServiceRecoveryAlert(
                            current.getName(),
                            current.getUrl()
                    );
                }
            }

        }, new CronTrigger(service.getCronExpression()));

        scheduledTasks.put(service.getId(), future);
    }

    private void updateNextCheckTime(ServiceEntity service) {
        if (service.getCronExpression() != null) {
            CronExpression cron = CronExpression.parse(service.getCronExpression());
            service.setNextCheck(cron.next(LocalDateTime.now()));
        }
    }

    private void validateCron(String cron) {
        try {
            CronExpression.parse(cron);
        } catch (Exception e) {
            throw new RuntimeException("Invalid Cron Expression");
        }
    }
}