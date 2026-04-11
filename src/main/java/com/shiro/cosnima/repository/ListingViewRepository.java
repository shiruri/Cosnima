package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.ListingView;
import com.shiro.cosnima.model.ListingViewId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingViewRepository extends JpaRepository<ListingView, ListingViewId> {

    // Check if a user already viewed a listing
    @Query("""
        SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END
        FROM ListingView v
        WHERE v.id.listingId = :listingId
        AND v.id.userId = :userId
    """)
    boolean hasUserViewed(
            @Param("listingId") String listingId,
            @Param("userId") java.util.UUID userId
    );
}
