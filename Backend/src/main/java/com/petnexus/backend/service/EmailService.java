package com.petnexus.backend.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String token);

    /** Generic notification e-mail (appointment confirmations, adoption decisions ...). Never throws. */
    void sendNotificationEmail(String to, String subject, String body);
}
