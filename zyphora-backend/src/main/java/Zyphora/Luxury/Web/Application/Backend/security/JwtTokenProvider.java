package Zyphora.Luxury.Web.Application.Backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private Key signingKey;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private int jwtExpiration;

    @PostConstruct
    public void init() {
        try {
            // Decode the Base64 secret
            byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);

            System.out.println("========================================");
            System.out.println("JWT Token Provider Initialized (HS256)");
            System.out.println("Key length: " + (keyBytes.length * 8) + " bits");
            System.out.println("Key valid for HS256: " + (keyBytes.length * 8 >= 256));
            System.out.println("========================================");
        } catch (Exception e) {
            System.err.println("ERROR: Failed to load JWT secret: " + e.getMessage());
            System.err.println("Generating a new secure key for HS256...");
            // Generate a 256-bit key for HS256
            this.signingKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            String newSecret = Base64.getEncoder().encodeToString(this.signingKey.getEncoded());
            System.err.println("========================================");
            System.err.println("ADD THIS TO YOUR application.properties:");
            System.err.println("jwt.secret=" + newSecret);
            System.err.println("========================================");
            throw new RuntimeException("JWT Secret configuration error", e);
        }
    }

    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("email", email);

        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)  // Changed to HS256
                .compact();

        System.out.println("Generated token for user: " + email);
        return token;
    }

    public String getEmailFromToken(String token) {
        try {
            String email = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
            return email;
        } catch (Exception e) {
            System.err.println("Failed to extract email: " + e.getMessage());
            return null;
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            System.err.println("Failed to extract userId: " + e.getMessage());
            return null;
        }
    }

    public String getRoleFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.get("role", String.class);
        } catch (Exception e) {
            System.err.println("Failed to extract role: " + e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException ex) {
            System.err.println("Invalid JWT: " + ex.getMessage());
            return false;
        }
    }
}