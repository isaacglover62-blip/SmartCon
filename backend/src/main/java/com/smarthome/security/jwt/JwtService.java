package com.smarthome.security.jwt;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtService {

    private final JwtProperties jwtProperties;
    private final ConfigurableJWTProcessor<SecurityContext> nimbusProcessor;

    public JwtService(JwtProperties jwtProperties,
                      @Value("${supabase.jwks-uri}") String jwksUri) throws Exception {
        this.jwtProperties = jwtProperties;
        JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<>(new URL(jwksUri));
        nimbusProcessor = new DefaultJWTProcessor<>();
        nimbusProcessor.setJWSKeySelector(
                new JWSVerificationKeySelector<>(JWSAlgorithm.ES256, jwkSource));
    }

    /** Validates a token — routes ES256 (Supabase) through JWKS, HS256 through local key. */
    public boolean isTokenValid(String token) {
        if ("ES256".equals(getAlgorithm(token))) {
            return isEs256Valid(token);
        }
        try {
            extractAllClaims(token);
            return !isHs256Expired(token);
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /** Validates a backend-issued HS256 token against a specific user. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isHs256Expired(token);
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /** Extracts the email from either a Supabase ES256 token or a backend HS256 token. */
    public String extractEmail(String token) {
        if ("ES256".equals(getAlgorithm(token))) {
            try {
                JWTClaimsSet claims = nimbusProcessor.process(token, null);
                String email = claims.getStringClaim("email");
                return (email != null && !email.isBlank()) ? email : claims.getSubject();
            } catch (Exception e) {
                log.warn("ES256 email extraction failed: {}", e.getMessage());
                return null;
            }
        }
        Claims claims = extractAllClaims(token);
        String email = claims.get("email", String.class);
        return (email != null && !email.isBlank()) ? email : claims.getSubject();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    public String generateToken(UserDetails userDetails) {
        return buildHs256Token(new HashMap<>(), userDetails, jwtProperties.getExpiration());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildHs256Token(new HashMap<>(), userDetails, jwtProperties.getRefreshExpiration());
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ── private helpers ──────────────────────────────────────────────────────

    private boolean isEs256Valid(String token) {
        try {
            JWTClaimsSet claims = nimbusProcessor.process(token, null);
            Date exp = claims.getExpirationTime();
            return exp == null || exp.after(new Date());
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean isHs256Expired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private String getAlgorithm(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String header = new String(Base64.getUrlDecoder().decode(parts[0]));
            if (header.contains("\"ES256\"")) return "ES256";
            if (header.contains("\"HS256\"")) return "HS256";
        } catch (Exception ignored) {}
        return null;
    }

    private String buildHs256Token(Map<String, Object> extra, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extra)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
