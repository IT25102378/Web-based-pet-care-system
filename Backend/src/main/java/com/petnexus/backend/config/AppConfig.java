package com.petnexus.backend.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AppConfig {

    /**
     * BCrypt password encoder bean.
     * Used by UserService to hash passwords on registration and verify on login.
     * Passwords are NEVER stored as plain text.
     *
     * Note: CORS is configured exclusively in SecurityConfig.corsConfigurationSource()
     * to ensure consistent behaviour with Spring Security's JWT filter chain.
     */
    /** One injectable clock so time-dependent rules (slot already passed, reminders) are testable. */
    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

