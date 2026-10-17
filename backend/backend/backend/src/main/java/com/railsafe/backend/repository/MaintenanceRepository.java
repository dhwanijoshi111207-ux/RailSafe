package com.railsafe.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.railsafe.backend.model.Maintenance;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
}
