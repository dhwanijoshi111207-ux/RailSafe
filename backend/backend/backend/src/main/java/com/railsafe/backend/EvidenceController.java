
package com.railsafe.backend;

import com.railsafe.backend.model.Evidence;
import com.railsafe.backend.repository.EvidenceRepository;

import org.springframework.http.MediaType;
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

    // Save before and after photos for a report.
    @PostMapping(
        value = "/upload",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Evidence uploadEvidence(
            @RequestParam Integer reportId,
            @RequestParam(required = false) MultipartFile beforePhoto,
            @RequestParam(required = false) MultipartFile afterPhoto)
            throws IOException {

        Evidence evidence = repository.findAll()
            .stream()
            .filter(e -> e.getReportId() != null
                    && e.getReportId().equals(reportId))
            .findFirst()
            .orElseGet(Evidence::new);

        evidence.setReportId(reportId);

        if (beforePhoto != null && !beforePhoto.isEmpty()) {
            validateImage(beforePhoto);

            evidence.setBeforePhoto(
                "data:" + getContentType(beforePhoto) + ";base64,"
                + Base64.getEncoder()
                    .encodeToString(beforePhoto.getBytes())
            );
        }

        if (afterPhoto != null && !afterPhoto.isEmpty()) {
            validateImage(afterPhoto);

            evidence.setAfterPhoto(
                "data:" + getContentType(afterPhoto) + ";base64,"
                + Base64.getEncoder()
                    .encodeToString(afterPhoto.getBytes())
            );
        }

        return repository.save(evidence);
    }

    // Retrieve before and after photos using the report ID.
    @GetMapping("/{reportId}")
    public Evidence getEvidence(@PathVariable Integer reportId) {

        List<Evidence> evidenceList = repository.findAll();

        return evidenceList.stream()
            .filter(e -> e.getReportId() != null
                    && e.getReportId().equals(reportId))
            .findFirst()
            .orElse(null);
    }

    private void validateImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please select a photo."
            );
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException(
                "Each photo must be 10 MB or smaller."
            );
        }

        if (ImageIO.read(
                new ByteArrayInputStream(file.getBytes())) == null) {
            throw new IllegalArgumentException(
                "Uploaded file is not a supported image."
            );
        }
    }

    private String getContentType(MultipartFile file) {

        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            return "image/jpeg";
        }

        return contentType;
    }
}
