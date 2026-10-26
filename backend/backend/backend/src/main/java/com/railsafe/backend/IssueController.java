package com.railsafe.backend;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.railsafe.backend.model.Issue;
import com.railsafe.backend.model.Maintenance;
import com.railsafe.backend.repository.IssueRepository;
import com.railsafe.backend.repository.MaintenanceRepository;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin
public class IssueController {

    private final IssueRepository issueRepository;
    private final MaintenanceRepository maintenanceRepository;

    public IssueController(
            IssueRepository issueRepository,
            MaintenanceRepository maintenanceRepository) {
        this.issueRepository = issueRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    // Create issue and automatically create maintenance record
    @PostMapping
    public Issue createIssue(@RequestBody Issue issue) {

        Issue savedIssue = issueRepository.save(issue);

        Maintenance maintenance = new Maintenance();
        maintenance.setReportId(savedIssue.getReportId());
        maintenance.setMaintenanceStatus("Awaiting Assignment");

        maintenanceRepository.save(maintenance);

        return savedIssue;
    }

    // Get all issues
    @GetMapping
    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    // Get issue by ID
    @GetMapping("/{id}")
    public Issue getIssue(@PathVariable Integer id) {
        return issueRepository.findById(id).orElse(null);
    }

    // Update issue status
    @PutMapping("/{id}/status")
    public Issue updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Issue issue = issueRepository.findById(id).orElse(null);

        if (issue != null) {
            issue.setStatus(status);
            return issueRepository.save(issue);
        }

        return null;
    }
} 