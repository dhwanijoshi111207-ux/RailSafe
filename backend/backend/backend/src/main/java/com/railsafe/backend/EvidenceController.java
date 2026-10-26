package com.railsafe.backend;

import com.railsafe.backend.model.Evidence;
import com.railsafe.backend.repository.EvidenceRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin
public class EvidenceController {

    private final EvidenceRepository repository;

    public EvidenceController(EvidenceRepository repository) {
        this.repository = repository;
    }

    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> uploadEvidence(
            @RequestParam String reportId,
            @RequestParam(required = false) MultipartFile beforePhoto,
            @RequestParam(required = false) MultipartFile afterPhoto) {

        try {
            Integer id = parseReportId(reportId);

            if ((beforePhoto == null || beforePhoto.isEmpty())
                    && (afterPhoto == null || afterPhoto.isEmpty())) {
                return ResponseEntity.badRequest()
                    .body("Please select at least one photo.");
            }

            if (beforePhoto != null && !beforePhoto.isEmpty()) {
                validateImage(beforePhoto);
            }

            if (afterPhoto != null && !afterPhoto.isEmpty()) {
                validateImage(afterPhoto);
            }

            Evidence evidence = repository.findAll()
                .stream()
                .filter(e -> e.getReportId() != null
                    && e.getReportId().equals(id))
                .findFirst()
                .orElseGet(Evidence::new);

            evidence.setReportId(id);

            if (beforePhoto != null && !beforePhoto.isEmpty()) {
                evidence.setBeforePhoto(toDataUrl(beforePhoto));
            }

            if (afterPhoto != null && !afterPhoto.isEmpty()) {
                evidence.setAfterPhoto(toDataUrl(afterPhoto));
            }

            return ResponseEntity.ok(repository.save(evidence));

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Unable to read the uploaded image.");
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<?> getEvidence(
            @PathVariable String reportId) {

        try {
            Integer id = parseReportId(reportId);

            List<Evidence> evidenceList = repository.findAll();

            return evidenceList.stream()
                .filter(e -> e.getReportId() != null
                    && e.getReportId().equals(id))
                .findFirst()
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());

        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    private Integer parseReportId(String value) {
        if (value == null) {
            throw new IllegalArgumentException("Report ID is required.");
        }

        String cleaned = value.trim().replaceFirst("(?i)^RR-", "");

        try {
            int id = Integer.parseInt(cleaned);

            if (id <= 0) {
                throw new IllegalArgumentException(
                    "Report ID must be a positive number."
                );
            }

            return id;
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException(
                "Enter a valid ID, for example RR-4."
            );
        }
    }

    private void validateImage(MultipartFile file) throws IOException {
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException(
                "Each photo must be 10 MB or smaller."
            );
        }

        String type = file.getContentType();

        if (type == null || !type.startsWith("image/")) {
            throw new IllegalArgumentException(
                "Please upload an image file."
            );
        }

        if (ImageIO.read(
                new ByteArrayInputStream(file.getBytes())) == null) {
            throw new IllegalArgumentException(
                "The uploaded file is not a supported image."
            );
        }
    }

    private String toDataUrl(MultipartFile file) throws IOException {
        return "data:" + file.getContentType() + ";base64,"
            + Base64.getEncoder().encodeToString(file.getBytes());
    }
}
