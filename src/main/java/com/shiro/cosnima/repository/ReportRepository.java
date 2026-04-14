package com.shiro.cosnima.repository;

import com.shiro.cosnima.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    Optional<Report> findByReporter_IdAndTargetIdAndTargetType(
            UUID reporterId,
            UUID targetId,
            Report.TargetType targetType
    );

    List<Report> findByReporterId(UUID reporterId);

}
