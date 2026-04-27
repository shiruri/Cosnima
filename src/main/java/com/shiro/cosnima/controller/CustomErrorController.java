package com.shiro.cosnima.controller;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Integer status = (Integer) request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (status != null && (status == 401 || status == 403)) {
            return "forward:/error/error.html";
        }
        return "forward:/error/error.html";
    }
}