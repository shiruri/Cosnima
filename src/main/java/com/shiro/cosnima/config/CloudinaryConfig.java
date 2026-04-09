package com.shiro.cosnima.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    private final CloudinaryProperties props;

    public CloudinaryConfig(CloudinaryProperties props) {
        this.props = props;
    }

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", props.getCloudName(),
                "api_key", props.getApiKey(),
                "api_secret", props.getApiSecret(),
                "secure", true
        ));
    }

}