package com.Health_Check_And_Monitoring_Web_Application.service;

import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.scheduling.support.SimpleTriggerContext;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.concurrent.ScheduledFuture;

@Service
public class DynamicSchedulerService {

    private final TaskScheduler scheduler;
    private ScheduledFuture<?> scheduledTask;
    private LocalDateTime lastCheck;
    private LocalDateTime nextCheck;

    public DynamicSchedulerService() {
        ThreadPoolTaskScheduler threadPoolTaskScheduler = new ThreadPoolTaskScheduler();
        threadPoolTaskScheduler.initialize();
        this.scheduler = threadPoolTaskScheduler;
    }

    public void scheduleJob(String cronExpression) {
        stopJob();

        scheduledTask = scheduler.schedule(() -> {
            System.out.println("Job executed at: " + LocalDateTime.now());

            lastCheck = LocalDateTime.now();
            nextCheck = getNextExecutionTime(cronExpression);

        }, new CronTrigger(cronExpression));
    }

    public void stopJob() {
        if (scheduledTask != null) {
            scheduledTask.cancel(false);
        }
    }

    public LocalDateTime getLastCheck() {
        return lastCheck;
    }

    public LocalDateTime getNextCheck() {
        return nextCheck;
    }

    private LocalDateTime getNextExecutionTime(String cronExpression) {
        CronTrigger trigger = new CronTrigger(cronExpression);
        Date nextExec = trigger.nextExecutionTime(new SimpleTriggerContext());
        return LocalDateTime.ofInstant(nextExec.toInstant(), ZoneId.systemDefault());
    }
}