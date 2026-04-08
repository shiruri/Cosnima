package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.UserLoginDto;
import com.shiro.cosnima.model.AuthResult;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authServ;

    @Autowired
    public AuthController(AuthService authServ) {
        this.authServ = authServ;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @Valid User user, BindingResult result) {
        if(result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );

            return ResponseEntity.badRequest().body(errors.toString());        }
        authServ.registerUser(user);
        return ResponseEntity.ok("User registered");

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResult> login(@RequestBody @Valid UserLoginDto user, BindingResult result) {
        if(result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
            return ResponseEntity.badRequest().body(new AuthResult(null,"ERROR"));
        }

        AuthResult authResult = authServ.loginUser(user);

        return ResponseEntity.ok().body(authResult);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestHeader("Authorization") String authorizationHeader) {
       if(authorizationHeader != null && authorizationHeader.startsWith(("Bearer "))) {
           String token = authorizationHeader.substring(7);
           return authServ.logoutUser(token);
       }
       return ResponseEntity.badRequest().body("Invalid Request");


    }

}

