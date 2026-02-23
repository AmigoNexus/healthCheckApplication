package com.Health_Check_And_Monitoring_Web_Application;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HealthCheckAndMonitoringWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthCheckAndMonitoringWebApplication.class, args);
    }

}