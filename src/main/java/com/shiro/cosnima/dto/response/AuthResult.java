package com.shiro.cosnima.dto.response;

import com.shiro.cosnima.dto.request.UserDto;

public record AuthResult(UserDto user, String token) {}


