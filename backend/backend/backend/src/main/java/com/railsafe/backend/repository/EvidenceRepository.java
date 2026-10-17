package com.railsafe.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.railsafe.backend.model.Evidence;

public interface EvidenceRepository extends JpaRepository<Evidence, Integer> {
}
