package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Listing;
import com.shiro.cosnima.model.ListingImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing,Long> {

    @Query("SELECT l FROM Listing l WHERE l.id = :id")
    List<Listing> getListingsById(@Param("id") long id);

    @Query("SELECT li FROM ListingImage li WHERE li.listing.id IN :listingIds")
    List<ListingImage> findImagesByListingIds(@Param("listingIds") List<Long> listingIds);

    @Query("""
SELECT l FROM Listing l
LEFT JOIN FETCH l.images
LEFT JOIN FETCH l.seller
WHERE l.id = :id
""")
    Optional<Listing> findByIdWithImages(@Param("id") Long id);


    @Query("""
SELECT l FROM Listing l
WHERE (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
AND (:minPrice IS NULL OR l.price >= :minPrice)
AND (:maxPrice IS NULL OR l.price <= :maxPrice)
AND (:condition IS NULL OR l.condition = :condition)
AND (:isActive IS NULL OR l.isActive = :isActive)
AND (:status IS NULL OR l.status = :status)
""")
    Page<Listing> getListings(
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("condition") Listing.Condition condition,
            @Param("isActive") Boolean isActive,
            @Param("status") Listing.Status status,
            Pageable pageable
    );


}
