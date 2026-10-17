
package com.railsafe.backend;

import com.railsafe.backend.model.Evidence;
import com.railsafe.backend.repository.EvidenceRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin
public class EvidenceController {

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
            String fileName = "RR-" + reportId
                    + "-before-" + Paths.get(
                            beforePhoto.getOriginalFilename() == null
                                    ? "before.jpg"
                                    : beforePhoto.getOriginalFilename()
                    ).getFileName();

            Files.copy(
                    beforePhoto.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );

            evidence.setBeforePhoto("/uploads/" + fileName);
        }

        if (afterPhoto != null && !afterPhoto.isEmpty()) {
            String fileName = "RR-" + reportId
                    + "-after-" + Paths.get(
                            afterPhoto.getOriginalFilename() == null
                                    ? "after.jpg"
                                    : afterPhoto.getOriginalFilename()
                    ).getFileName();

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
    public Object compareEvidence(
            @RequestParam("beforePhoto") MultipartFile beforePhoto,
            @RequestParam("afterPhoto") MultipartFile afterPhoto)
            throws IOException {

        if (beforePhoto.isEmpty() || afterPhoto.isEmpty()) {
            throw new IllegalArgumentException(
                    "Please upload both before and after photos."
            );
        }

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

        String baseUrl = cvServiceUrl.replaceAll("/+$", "");

        try {
            return RestClient.create()
                    .post()
                    .uri(baseUrl + "/compare")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(Object.class);

        } catch (RestClientException ex) {
            throw new RuntimeException(
                    "CV comparison service request failed: "
                            + ex.getMessage(),
                    ex
            );
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
