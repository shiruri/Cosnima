package com.shiro.cosnima.service;

import com.shiro.cosnima.dto.response.TagDto;
import com.shiro.cosnima.model.Tags;
import com.shiro.cosnima.repository.TagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TagService {

    private final TagRepository tagRepo;

    public TagService(TagRepository tagRepo) {
        this.tagRepo = tagRepo;
    }


    public List<TagDto> getTags() {
        return tagRepo.findAll().stream()
                .map(tag -> new TagDto(tag.getId(), tag.getName()))
                .collect(Collectors.toList());
    }
}
