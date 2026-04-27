package com.immigrationhelper.infrastructure.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
public class JwtTokenProvider {

    private final SecretKey signingKey;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtTokenProvider(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration-ms}") long expirationMs,
        @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
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

    public String getEmailFromToken(String token) {
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

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired");
        } catch (JwtException e) {
            log.debug("Invalid JWT: {}", e.getMessage());
        }
        return false;
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
