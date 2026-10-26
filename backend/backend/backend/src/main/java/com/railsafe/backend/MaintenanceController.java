
package com.railsafe.backend;

import com.railsafe.backend.model.Maintenance;
import com.railsafe.backend.repository.MaintenanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin
public class MaintenanceController {

    private final MaintenanceRepository repository;

    public MaintenanceController(MaintenanceRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Maintenance createMaintenance(
            @RequestBody Maintenance maintenance) {

        if (maintenance.getMaintenanceStatus() == null
                || maintenance.getMaintenanceStatus().isBlank()) {
            maintenance.setMaintenanceStatus("Awaiting Assignment");
        }

        if ("Under Maintenance".equalsIgnoreCase(
                maintenance.getMaintenanceStatus())
                && maintenance.getStartedAt() == null) {
            maintenance.setStartedAt(LocalDateTime.now());
        }

        if ("Resolved".equalsIgnoreCase(
                maintenance.getMaintenanceStatus())
                && maintenance.getCompletedAt() == null) {
            maintenance.setCompletedAt(LocalDateTime.now());
        }

        return repository.save(maintenance);
    }

    @GetMapping
    public List<Maintenance> getAllMaintenance() {
        return repository.findAll();
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<Maintenance> getMaintenance(
            @PathVariable Integer reportId) {

        return repository.findAll().stream()
                .filter(m -> m.getReportId() != null
                        && m.getReportId().equals(reportId))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{reportId}")
    public ResponseEntity<Maintenance> updateMaintenance(
            @PathVariable Integer reportId,
            @RequestBody Maintenance updated) {

        Maintenance maintenance = repository.findAll().stream()
                .filter(m -> m.getReportId() != null
                        && m.getReportId().equals(reportId))
                .findFirst()
                .orElse(null);

        if (maintenance == null) {
            updated.setReportId(reportId);

            if (updated.getMaintenanceStatus() == null
                    || updated.getMaintenanceStatus().isBlank()) {
                updated.setMaintenanceStatus("Awaiting Assignment");
            }

            if ("Under Maintenance".equalsIgnoreCase(
                    updated.getMaintenanceStatus())) {
                updated.setStartedAt(LocalDateTime.now());
            }

            if ("Resolved".equalsIgnoreCase(
                    updated.getMaintenanceStatus())) {
                updated.setCompletedAt(LocalDateTime.now());
            }

            return ResponseEntity.ok(repository.save(updated));
        }

        maintenance.setAssignedTeam(updated.getAssignedTeam());
        maintenance.setAssignedOfficer(updated.getAssignedOfficer());

        if (updated.getMaintenanceStatus() != null) {
            maintenance.setMaintenanceStatus(
                    updated.getMaintenanceStatus());

            if ("Under Maintenance".equalsIgnoreCase(
                    updated.getMaintenanceStatus())
                    && maintenance.getStartedAt() == null) {
                maintenance.setStartedAt(LocalDateTime.now());
            }

            if ("Resolved".equalsIgnoreCase(
                    updated.getMaintenanceStatus())) {
                maintenance.setCompletedAt(LocalDateTime.now());
            }
        }

        return ResponseEntity.ok(repository.save(maintenance));
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Void> deleteMaintenance(
            @PathVariable Integer reportId) {

        Maintenance maintenance = repository.findAll().stream()
                .filter(m -> m.getReportId() != null
                        && m.getReportId().equals(reportId))
                .findFirst()
                .orElse(null);

        if (maintenance == null) {
            return ResponseEntity.notFound().build();
        }

        repository.delete(maintenance);
        return ResponseEntity.noContent().build();
    }
}
