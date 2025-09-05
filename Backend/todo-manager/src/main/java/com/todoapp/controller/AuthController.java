package com.todoapp.controller;

import com.todoapp.dto.AuthResponse;
import com.todoapp.dto.LoginRequest;
import com.todoapp.dto.RegisterRequest;
import com.todoapp.entity.User;
import com.todoapp.service.UserService;
import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private int jwtExpiration;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(
                request.getUsername(), 
                request.getPassword(), 
                request.getEmail()
            );
            
            String token = generateToken(user.getUsername());
            
            return ResponseEntity.ok(new AuthResponse(
                token, 
                user.getUsername(), 
                "User registered successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(new AuthResponse(null, null, e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userService.findByUsername(request.getUsername());
        
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (userService.checkPassword(user, request.getPassword())) {
                String token = generateToken(user.getUsername());
                
                return ResponseEntity.ok(new AuthResponse(
                    token, 
                    user.getUsername(), 
                    "Login successful"
                ));
            }
        }
        
        return ResponseEntity.badRequest()
            .body(new AuthResponse(null, null, "Invalid username or password"));
    }
    
    private String generateToken(String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8))) // non-deprecated
            .compact();
    }
}