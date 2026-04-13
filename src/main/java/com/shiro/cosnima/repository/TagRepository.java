package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Tags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository

public interface TagRepository extends JpaRepository<Tags, Long> {
    Optional<Tags> findByName(String name);
}
