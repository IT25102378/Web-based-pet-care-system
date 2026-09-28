package com.petnexus.backend.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configuration properties for JWT authentication.
 * Configured via application.properties (petnexus.jwt.*).
 */
@Component
@ConfigurationProperties(prefix = "petnexus.jwt")
@Data
public class JwtProperties {

    /**
     * HMAC-SHA256 signing secret key (Base64 encoded or 256-bit plaintext).
     * Defaults to a secure 256-bit key for local development.
     */
    private String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    /**
     * Access token validity in milliseconds (default: 86400000ms = 24 hours).
     */
    private long expirationMs = 86400000L;
}
