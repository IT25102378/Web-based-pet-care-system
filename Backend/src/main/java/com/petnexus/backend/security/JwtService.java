package com.petnexus.backend.security;

import com.petnexus.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service responsible for JWT token generation, parsing, claim extraction, and validation.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final JwtProperties jwtProperties;

    /**
     * Generate standard access token for an authenticated User.
     */
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("role", user.getRole() != null ? user.getRole().name() : null);
        claims.put("fullName", user.getFullName());
        return buildToken(claims, user.getEmail(), jwtProperties.getExpirationMs());
    }

    /**
     * Generate token with custom expiration (used for testing expired tokens).
     */
    public String generateTokenWithExpiration(User user, long expirationMs) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getUserId());
        claims.put("role", user.getRole() != null ? user.getRole().name() : null);
        claims.put("fullName", user.getFullName());
        return buildToken(claims, user.getEmail(), expirationMs);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expirationMs) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null ? claims.get("userId", String.class) : null;
    }

    public String extractRole(String token) {
        Claims claims = extractAllClaims(token);
        return claims != null ? claims.get("role", String.class) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claims != null ? claimsResolver.apply(claims) : null;
    }

    public boolean isTokenValid(String token, User user) {
        final String email = extractEmail(token);
        return (email != null && email.equalsIgnoreCase(user.getEmail()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        return expiration != null && expiration.before(new Date());
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired: {}", e.getMessage());
            throw e;
        } catch (SecurityException | MalformedJwtException | UnsupportedJwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            throw e;
        }
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(jwtProperties.getSecret());
        } catch (Exception e) {
            keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
