package com.Health_Check_And_Monitoring_Web_Application.controller;

import com.Health_Check_And_Monitoring_Web_Application.service.DynamicSchedulerService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scheduler")
public class SchedulerController {

    private final DynamicSchedulerService schedulerService;

    public SchedulerController(DynamicSchedulerService schedulerService) {
        this.schedulerService = schedulerService;
    }

    @PostMapping("/start")
    public String startJob(@RequestParam String cron) {
        schedulerService.scheduleJob(cron);
        return "Job scheduled with cron: " + cron;
    }

    @PostMapping("/stop")
    public String stopJob() {
        schedulerService.stopJob();
        return "Job stopped";
    }

    @GetMapping("/status")
    public String status() {
        return "Last Check: " + schedulerService.getLastCheck() +
                ", Next Check: " + schedulerService.getNextCheck();
    }
}

