package com.shiro.cosnima;

import com.shiro.cosnima.config.CloudinaryProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CosnimeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CosnimeApplication.class, args);
    }

}
