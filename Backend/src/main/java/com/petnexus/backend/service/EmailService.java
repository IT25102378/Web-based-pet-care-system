package com.petnexus.backend.service;

public interface EmailService {

    void sendPasswordResetEmail(String to, String token);
}
