package com.immigrationhelper.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    static final String PLACEHOLDER_SECRET =
        "your-256-bit-secret-key-change-in-production-min-32-chars";

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;
    private final String secret;
    private final Environment environment;

    public JwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration-ms}") long expirationMs,
        @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs,
        Environment environment
    ) {
        this.secret = secret;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
        this.environment = environment;
    }

    @PostConstruct
    void verifySecret() {
        if (!PLACEHOLDER_SECRET.equals(secret)) {
            return;
        }
        boolean isDev = Arrays.asList(environment.getActiveProfiles()).contains("dev");
        if (isDev) {
            log.warn("JWT secret is the placeholder default — acceptable in dev profile only.");
            return;
        }
        throw new IllegalStateException("JWT secret must be overridden in non-dev profiles");
    }

    public String generateToken(String email) {
        return buildToken(email, expirationMs, "access");
    }

    public String generateRefreshToken(String email) {
        return buildToken(email, refreshExpirationMs, "refresh");
    }

    private String buildToken(String email, long expiryMs, String tokenType) {
        Date now = new Date();
        return Jwts.builder()
            .subject(email)
            .claim("type", tokenType)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expiryMs))
            .signWith(signingKey)
            .compact();
    }

    /** Used by AuthService for the refresh-token flow. */
    public String getEmailFromToken(String token) {
        return getUserEmailFromToken(token);
    }

    public String getUserEmailFromToken(String token) {
        try {
            return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
        } catch (JwtException e) {
            log.debug("Failed to extract email from JWT: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(authToken);
            return true;
        } catch (ExpiredJwtException ex) {
            log.debug("Expired JWT token");
        } catch (JwtException ex) {
            log.debug("Invalid JWT token: {}", ex.getMessage());
        }
        return false;
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
