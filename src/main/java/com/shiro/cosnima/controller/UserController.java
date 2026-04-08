package com.shiro.cosnima.controller;

import com.shiro.cosnima.dto.UserDto;
import com.shiro.cosnima.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private final UserService userServ;

    public UserController(UserService userServ) {
        this.userServ = userServ;
    }

    @GetMapping
    public List<UserDto> getUsers() {
        return userServ.getUsers();
    }

    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable UUID id) {
        return userServ.getUserById(id);
    }
}
