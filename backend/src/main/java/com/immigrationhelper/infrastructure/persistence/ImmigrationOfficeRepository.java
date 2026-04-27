package com.immigrationhelper.infrastructure.persistence;

import com.immigrationhelper.domain.entity.ImmigrationOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImmigrationOfficeRepository extends JpaRepository<ImmigrationOffice, Long> {

    List<ImmigrationOffice> findByCityContainingIgnoreCase(String city);

    @Query(value = """
        SELECT * FROM immigration_offices
        ORDER BY (
          6371 * acos(
            cos(radians(:lat)) * cos(radians(latitude)) *
            cos(radians(longitude) - radians(:lon)) +
            sin(radians(:lat)) * sin(radians(latitude))
          )
        )
        LIMIT :limit
        """, nativeQuery = true)
    List<ImmigrationOffice> findNearestOffices(
        @Param("lat") double lat,
        @Param("lon") double lon,
        @Param("limit") int limit
    );
}
