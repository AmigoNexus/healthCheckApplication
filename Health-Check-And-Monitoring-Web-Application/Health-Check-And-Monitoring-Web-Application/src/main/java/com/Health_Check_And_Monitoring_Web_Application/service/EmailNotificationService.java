package com.Health_Check_And_Monitoring_Web_Application.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailNotificationService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${email.notification.from}")
    private String fromEmail;

    @Value("${email.notification.to}")
    private String[] toEmails;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void sendServiceDownAlert(String serviceName,
                                     String url,
                                     String errorMessage) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmails);
            helper.setSubject("🚨 CRITICAL ALERT: Service DOWN - " + serviceName);

            helper.setText(buildDownEmailHtml(serviceName, url, errorMessage), true);

            mailSender.send(mimeMessage);

            log.info("DOWN alert email sent for {}", serviceName);

        } catch (Exception e) {
            log.error("Failed to send DOWN alert email", e);
        }
    }
    public void sendServiceRecoveryAlert(String serviceName,
                                         String url) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmails);
            helper.setSubject("✅ RESOLVED: Service UP - " + serviceName);

            helper.setText(buildRecoveryEmailHtml(serviceName, url), true);

            mailSender.send(mimeMessage);

            log.info("Recovery email sent for {}", serviceName);

        } catch (Exception e) {
            log.error("Failed to send recovery email", e);
        }
    }
    private String buildDownEmailHtml(String serviceName,
                                      String url,
                                      String errorMessage) {

        String time = getCurrentTime();

        return """
                <div style="font-family: Arial, sans-serif; background-color:#f8f9fa; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        
                        <h2 style="color:#dc3545;">🚨 Service Down Alert</h2>
                        
                        <p><strong>Service Name:</strong> %s</p>
                        <p><strong>URL:</strong> %s</p>
                        <p><strong>Status:</strong> <span style="color:#dc3545; font-weight:bold;">DOWN</span></p>
                        <p><strong>Error:</strong> %s</p>
                        <p><strong>Time:</strong> %s</p>
                        
                        <div style="margin-top:20px; padding:15px; background:#ffe5e5; border-left:4px solid #dc3545;">
                            Immediate attention required. Please investigate the issue.
                        </div>
                        
                        <hr style="margin-top:30px;">
                        <p style="font-size:12px; color:#6c757d;">
                            Health Monitoring System<br>
                            Amigo Nexus Technology
                        </p>
                    </div>
                </div>
                """.formatted(serviceName, url, errorMessage, time);
    }

    private String buildRecoveryEmailHtml(String serviceName,
                                          String url) {

        String time = getCurrentTime();

        return """
                <div style="font-family: Arial, sans-serif; background-color:#f8f9fa; padding:20px;">
                    <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        
                        <h2 style="color:#28a745;">✅ Service Restored</h2>
                        
                        <p><strong>Service Name:</strong> %s</p>
                        <p><strong>URL:</strong> %s</p>
                        <p><strong>Status:</strong> <span style="color:#28a745; font-weight:bold;">UP</span></p>
                        <p><strong>Recovered At:</strong> %s</p>
                        
                        <div style="margin-top:20px; padding:15px; background:#e6ffed; border-left:4px solid #28a745;">
                            The service is now operational and functioning normally.
                        </div>
                        
                        <hr style="margin-top:30px;">
                        <p style="font-size:12px; color:#6c757d;">
                            Health Monitoring System<br>
                            Amigo Nexus Technology
                        </p>
                    </div>
                </div>
                """.formatted(serviceName, url, time);
    }

    private String getCurrentTime() {
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm:ss a");
        return LocalDateTime.now().format(formatter);
    }
}