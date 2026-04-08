package com.shiro.cosnima.controller;


import com.shiro.cosnima.dto.UserDto;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class UserController {

    private final UserService userServ;

    @Autowired
    public UserController(UserService userServ) {
        this.userServ = userServ;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @Valid User user, BindingResult result) {
        if(result.hasErrors()) {
            Map<String, String> errors = new HashMap<>();

            result.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );

            return ResponseEntity.badRequest().body(errors.toString());        }
        userServ.registerUser(user);
        return ResponseEntity.ok("User registered");


    }
}
