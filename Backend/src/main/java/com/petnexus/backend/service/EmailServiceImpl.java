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

    @Value("${spring.mail.host:}")
    private String mailHost;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }


    /**
     * Sends a password reset link to the user.
     *
     * @param toEmail recipient email address
     * @param token   UUID password reset token stored on the User entity
     */
    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;

        boolean isSmtpConfigured = fromEmail != null && !fromEmail.isBlank() &&
                mailHost != null && !mailHost.isBlank() && !"localhost".equalsIgnoreCase(mailHost);

        if (!isSmtpConfigured) {
            log.info("================================================================================");
            log.info("[PETNEXUS DEV EMAIL SERVICE] SMTP unconfigured or in local dev mode.");
            log.info("Recipient : {}", toEmail);
            log.info("Subject   : PetNexus — Password Reset Request");
            log.info("Link      : {}", resetLink);
            log.info("================================================================================");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("PetNexus — Password Reset Request");
            message.setText(
                    "Hello,\n\n" +
                    "We received a request to reset your password for your PetNexus account.\n\n" +
                    "Please click the link below to set a new password:\n\n" +
                    resetLink + "\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Regards,\n" +
                    "PetNexus Team"
            );

            mailSender.send(message);
            log.info("Password reset email successfully dispatched to: {}", toEmail);
        } catch (Exception ex) {
            log.warn("[PETNEXUS EMAIL WARNING] Failed to send password reset email via SMTP ({}); link: {}", ex.getMessage(), resetLink);
        }
    }
}
