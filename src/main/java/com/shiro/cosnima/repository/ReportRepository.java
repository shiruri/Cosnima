package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    @Query("SELECT r FROM Report r " +
            "LEFT JOIN FETCH r.reporter " +
            "LEFT JOIN FETCH r.reviewedBy")
    Page<Report> findAllWithUsers(Pageable pageable);

    @Query("SELECT r FROM Report r WHERE r.id = :id")
    Optional<Report> findByIdString(@Param("id") String id);

    Optional<Report> findByReporter_IdAndTargetIdAndTargetType(
            UUID reporterId,
            String targetId,
            Report.TargetType targetType
    );

    long countByStatus(Report.Status status);

    List<Report> findByReporter_Id(UUID reporterId);
}
