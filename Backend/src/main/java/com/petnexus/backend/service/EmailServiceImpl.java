package com.petnexus.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * EmailServiceImpl — sends transactional emails via JavaMailSender (SMTP).
 *
 * SMTP settings are read from environment variables:
 *   MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD
 * configured in application.properties via ${...} placeholders.
 *
 * If SMTP is not configured, registration will still succeed;
 * the failure is caught in UserService and logged (non-fatal).
 */
@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${petnexus.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an email-verification link to the newly registered user.
     *
     * @param toEmail recipient email address
     * @param token   UUID email-verification token stored on the User entity
     */
    @Override
    public void sendVerificationEmail(String toEmail, String token) {
        String verificationLink = frontendUrl + "/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "noreply@petnexus.local";
        message.setFrom(sender);
        message.setTo(toEmail);
        message.setSubject("PetNexus — Verify Your Email Address");
        message.setText(
                "Hello,\n\n" +
                "Thank you for registering with PetNexus Veterinary & Rescue Clinic.\n\n" +
                "Please verify your email address by clicking the link below:\n\n" +
                verificationLink + "\n\n" +
                "After verification, your account will be submitted for administrator approval.\n" +
                "You will be able to log in once the clinic team has reviewed and approved your account.\n\n" +
                "If you did not register for PetNexus, please ignore this email.\n\n" +
                "Regards,\n" +
                "PetNexus Team"
        );

        mailSender.send(message);
        log.info("Verification email successfully dispatched to: {}", toEmail);
    }
}
