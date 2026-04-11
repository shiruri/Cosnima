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
WHERE l.id = :id
""")
    Optional<Listing> findByIdWithImages(@Param("id") Long id);


    @Query("""
    SELECT l FROM Listing l
    WHERE (:keyword IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
    AND (:category IS NULL OR l.category = :category)
    AND (:minPrice IS NULL OR l.price >= :minPrice)
    AND (:maxPrice IS NULL OR l.price <= :maxPrice)
    AND (:condition IS NULL OR l.condition = :condition)
    AND (:isAvailable IS NULL OR l.isAvailable = :isAvailable)
""")
    Page<Listing> getListings(
            String keyword,
            String category,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String condition,
            Boolean isAvailable,
            Pageable pageable
    );

}
