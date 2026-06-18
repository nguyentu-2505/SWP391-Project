package com.example.swp.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Mock EmailService — prints email content to console log instead of sending real emails.
 * Use this for local development/demo when SMTP is not configured.
 * To switch to real email: replace this class body with JavaMailSender implementation
 * and configure spring.mail.* in application.properties.
 */
@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendSimpleMessage(String to, String subject, String text) {
        log.info("\n====================================================");
        log.info("[MOCK EMAIL] To      : {}", to);
        log.info("[MOCK EMAIL] Subject : {}", subject);
        log.info("[MOCK EMAIL] Body    : {}", text);
        log.info("====================================================\n");
    }
}