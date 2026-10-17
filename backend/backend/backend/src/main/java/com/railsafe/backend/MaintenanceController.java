package com.railsafe.backend;

import com.railsafe.backend.model.Maintenance;
import com.railsafe.backend.repository.MaintenanceRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin
public class MaintenanceController {

    private final MaintenanceRepository repository;

    public MaintenanceController(MaintenanceRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Maintenance createMaintenance(@RequestBody Maintenance maintenance) {
        return repository.save(maintenance);
    }

    @GetMapping("/{reportId}")
    public Maintenance getMaintenance(@PathVariable Integer reportId) {
        return repository.findAll()
                .stream()
                .filter(m -> m.getReportId().equals(reportId))
                .findFirst()
                .orElse(null);
    }

    @PutMapping("/{reportId}")
    public Maintenance updateMaintenance(
            @PathVariable Integer reportId,
            @RequestBody Maintenance updated) {

        Maintenance maintenance = repository.findAll()
                .stream()
                .filter(m -> m.getReportId().equals(reportId))
                .findFirst()
                .orElse(null);

        if (maintenance == null) {
            updated.setReportId(reportId);
            return repository.save(updated);
        }

        maintenance.setAssignedTeam(updated.getAssignedTeam());
        maintenance.setAssignedOfficer(updated.getAssignedOfficer());
        maintenance.setMaintenanceStatus(updated.getMaintenanceStatus());
        maintenance.setStartedAt(updated.getStartedAt());
        maintenance.setCompletedAt(updated.getCompletedAt());

        return repository.save(maintenance);
    }
}
