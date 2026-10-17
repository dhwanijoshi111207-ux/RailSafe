package com.railsafe.backend;

import com.railsafe.backend.model.Issue;
import com.railsafe.backend.repository.IssueRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@CrossOrigin
public class IssueController {

    private final IssueRepository repository;

    public IssueController(IssueRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Issue createIssue(@RequestBody Issue issue) {
        return repository.save(issue);
    }

    @GetMapping
    public List<Issue> getAllIssues() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public Issue getIssue(@PathVariable Integer id) {
        return repository.findById(id).orElse(null);
    }

    @PutMapping("/{id}/status")
    public Issue updateStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Issue issue = repository.findById(id).orElse(null);

        if (issue != null) {
            issue.setStatus(status);
            return repository.save(issue);
        }

        return null;
    }
}
