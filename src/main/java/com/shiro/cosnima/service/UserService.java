package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.UserDto;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public List<UserDto> getUsers() {
         return userRepo.findAll().stream()
                 .map(UserDto::fromEntity)
                 .toList();

    }

    public UserDto getUserById(UUID id) {
        User user = userRepo.findUserById(id).orElseThrow(() -> new RuntimeException("User not found"));

        return UserDto.fromEntity(user);

    }
}
