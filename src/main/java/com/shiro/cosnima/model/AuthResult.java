package com.shiro.cosnima.model;

import com.shiro.cosnima.dto.UserDto;

public record AuthResult(UserDto user, String token) {}


