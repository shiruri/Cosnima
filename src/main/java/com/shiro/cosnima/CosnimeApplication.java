package com.shiro.cosnima;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class CosnimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CosnimeApplication.class, args);
    }

}
