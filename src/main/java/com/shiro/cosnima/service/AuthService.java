package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.UserDto;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    @Autowired
    public AuthService(UserRepository userRepo) {
        this.userRepo = userRepo;
        this.encoder = new BCryptPasswordEncoder();
        ;
    }

    public List<UserDto>getUsers() {
            return userRepo.findAll().stream()
                    .map(UserDto::fromEntity)
                    .collect(Collectors.toList());
    }

    public void registerUser(User user) {
        user.setPasswordHash(encoder.encode(user.getPasswordHash()));
        userRepo.save(user);
    }
}
