package com.shiro.cosnima.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Constructor injection – uses the bean from CloudinaryConfig
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map uploadImage(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
        ));
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId != null) {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
    }
}