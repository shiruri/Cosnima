package com.shiro.cosnima.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

/**
 * Utility class for generating and validating JWT tokens using UUID (user ID).
 */
@Component
public class JwtUtils {

    private final Key key;
    private final long jwtExpirationMs;

    public JwtUtils(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration-ms}") long jwtExpirationMs) {
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Generate a JWT token for a given user ID (UUID).
     * @param userId the user's UUID as string
     * @return JWT token
     */
    public String generateToken(String userId) {
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate a JWT token for a given UUID object.
     * @param userId the user's UUID
     * @return JWT token
     */
    public String generateToken(UUID userId) {
        return generateToken(userId.toString());
    }

    /**
     * Extract user ID (UUID string) from JWT token.
     */
    public String extractUserId(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract a specific claim from the token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Validate the token against the user ID and expiration.
     * @param token JWT token
     * @param userId expected user ID (UUID string)
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token, String userId) {
        try {
            String extractedUserId = extractUserId(token);
            return (extractedUserId.equals(userId) && !isTokenExpired(token));
        } catch (JwtException | IllegalArgumentException e) {
            return false; // Invalid token
        }
    }

    /**
     * Validate the token against a UUID object.
     */
    public boolean validateToken(String token, UUID userId) {
        return validateToken(token, userId.toString());
    }

    /**
     * Check if the token is expired.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extract expiration date from token.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extract all claims from token.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}