package com.example.swp.security.jwt;

import com.example.swp.features.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.function.Function;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt-secret}")
    private String jwtSecret;

    @Value("${app.jwt-access-token-expiration-ms}")
    private int jwtAccessTokenExpirationInMs;

    @Value("${app.jwt-refresh-token-expiration-ms}")
    private int jwtRefreshTokenExpirationInMs;

    public String generateAccessToken(User user) {
        return generateToken(user.getUsername(), jwtAccessTokenExpirationInMs);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user.getUsername(), jwtRefreshTokenExpirationInMs);
    }

    public String getUsernameFromJWT(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (Exception ex) {
            // You can log the exception here
        }
        return false;
    }

    private String generateToken(String subject, int expirationInMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationInMs);

        return Jwts.builder()
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }
}
