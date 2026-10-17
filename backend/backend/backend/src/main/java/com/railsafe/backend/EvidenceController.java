
package com.railsafe.backend;

import com.railsafe.backend.model.Evidence;
import com.railsafe.backend.repository.EvidenceRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin
public class EvidenceController {

    private static final Logger log =
            LoggerFactory.getLogger(EvidenceController.class);

    private final EvidenceRepository repository;

    @Value("${CV_SERVICE_URL:https://railsafe.onrender.com}")
    private String cvServiceUrl;

    public EvidenceController(EvidenceRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/upload")
    public Evidence uploadEvidence(
            @RequestParam Integer reportId,
            @RequestParam(required = false) MultipartFile beforePhoto,
            @RequestParam(required = false) MultipartFile afterPhoto)
            throws IOException {

        Path uploadPath = Paths.get(
                System.getProperty("java.io.tmpdir"),
                "railsafe-uploads"
        );

        Files.createDirectories(uploadPath);

        Evidence evidence = repository.findAll()
                .stream()
                .filter(e -> e.getReportId() != null
                        && e.getReportId().equals(reportId))
                .findFirst()
                .orElse(new Evidence());

        evidence.setReportId(reportId);

        if (beforePhoto != null && !beforePhoto.isEmpty()) {
            String originalName = beforePhoto.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                originalName = "before.jpg";
            }

            String fileName = "RR-" + reportId + "-before-"
                    + Paths.get(originalName).getFileName();

            Files.copy(
                    beforePhoto.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );

            evidence.setBeforePhoto("/uploads/" + fileName);
        }

        if (afterPhoto != null && !afterPhoto.isEmpty()) {
            String originalName = afterPhoto.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                originalName = "after.jpg";
            }

            String fileName = "RR-" + reportId + "-after-"
                    + Paths.get(originalName).getFileName();

            Files.copy(
                    afterPhoto.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );

            evidence.setAfterPhoto("/uploads/" + fileName);
        }

        return repository.save(evidence);
    }

    @PostMapping(
            value = "/compare",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> compareEvidence(
            @RequestParam("beforePhoto") MultipartFile beforePhoto,
            @RequestParam("afterPhoto") MultipartFile afterPhoto)
            throws IOException {

        if (beforePhoto.isEmpty() || afterPhoto.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error",
                            "Please upload both before and after photos.")
            );
        }

        String baseUrl = cvServiceUrl.replaceAll("/+$", "");

        MultiValueMap<String, Object> body =
                new LinkedMultiValueMap<>();

        body.add("before", new ByteArrayResource(
                beforePhoto.getBytes()) {
            @Override
            public String getFilename() {
                return beforePhoto.getOriginalFilename() != null
                        ? beforePhoto.getOriginalFilename()
                        : "before.jpg";
            }
        });

        body.add("after", new ByteArrayResource(
                afterPhoto.getBytes()) {
            @Override
            public String getFilename() {
                return afterPhoto.getOriginalFilename() != null
                        ? afterPhoto.getOriginalFilename()
                        : "after.jpg";
            }
        });

        log.info("Starting photo comparison. CV service URL: {}/compare",
                baseUrl);

        try {
            Object result = RestClient.create()
                    .post()
                    .uri(baseUrl + "/compare")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Object.class);

            log.info("Photo comparison completed successfully.");

            return ResponseEntity.ok(result);

        } catch (RestClientResponseException ex) {
            log.error(
                    "CV service returned HTTP {}. Response: {}",
                    ex.getStatusCode().value(),
                    ex.getResponseBodyAsString()
            );

            return ResponseEntity.status(ex.getStatusCode())
                    .body(Map.of(
                            "error", "CV comparison service returned an error.",
                            "details", ex.getResponseBodyAsString()
                    ));

        } catch (RestClientException ex) {
            log.error("Could not connect to CV comparison service.", ex);

            return ResponseEntity.status(
                    HttpStatus.BAD_GATEWAY
            ).body(Map.of(
                    "error", "Could not connect to the CV comparison service.",
                    "details", ex.getMessage() == null
                            ? "No additional details available."
                            : ex.getMessage()
            ));
        }
    }

    @GetMapping("/{reportId}")
    public Evidence getEvidence(@PathVariable Integer reportId) {
        return repository.findAll()
                .stream()
                .filter(e -> e.getReportId() != null
                        && e.getReportId().equals(reportId))
                .findFirst()
                .orElse(null);
    }
}
