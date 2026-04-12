package com.shiro.cosnima.model;

import com.shiro.cosnima.model.Listing;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "tags")
public class Tags {

    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @ManyToMany(mappedBy = "tags")
    private List<Listing> listings;

    public List<Listing> getListings() {
        return listings;
    }

    public void setListings(List<Listing> listings) {
        this.listings = listings;
    }
}
