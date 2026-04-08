package com.shiro.cosnima.service;


import com.shiro.cosnima.dto.UserDto;
import com.shiro.cosnima.dto.UserLoginDto;
import com.shiro.cosnima.model.AuthResult;
import com.shiro.cosnima.model.User;
import com.shiro.cosnima.repository.UserRepository;
import com.shiro.cosnima.security.JwtUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    @Autowired
    public AuthService(UserRepository userRepo, JwtUtils jwtUtils) {
        this.userRepo = userRepo;
        this.encoder = new BCryptPasswordEncoder();
        this.jwtUtils = jwtUtils;
    }

    public void registerUser(User user) {
        user.setPasswordHash(encoder.encode(user.getPasswordHash()));
        user.setIsActive(true);
        userRepo.save(user);
    }
    public int setUserActive(String username, boolean status) {
        return userRepo.updateIsActive(username,status);
    }
    public AuthResult loginUser(UserLoginDto userLogin) {

        Optional<User> optionalUser;
        if(userLogin.getLogin().contains("@")) {
            optionalUser = userRepo.findByEmail(userLogin.getLogin());
        } else {
            optionalUser = userRepo.findByUsername(userLogin.getLogin());
        }

        User user = optionalUser.orElseThrow(() -> new RuntimeException("User not found"));

        if(!encoder.matches(userLogin.getPassword(), user.getPasswordHash())) {
            return new AuthResult(null,"ERORR HASH");
        }
        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResult(UserDto.fromEntity(user), token);
    }
    public ResponseEntity<?> logoutUser(String token) {
        int isUpdated = setUserActive(jwtUtils.extractUsername(token),false);
        if(isUpdated < 0) {
            return ResponseEntity.badRequest().body("Internal Server Error");
        }
        return ResponseEntity.ok().body("Succesfully logged out");
    }



}
