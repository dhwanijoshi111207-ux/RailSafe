
package com.railsafe.backend;

import com.railsafe.backend.model.Evidence;
import com.railsafe.backend.repository.EvidenceRepository;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Base64;

@RestController
@RequestMapping("/api/evidence")
@CrossOrigin
public class EvidenceController {

    private final EvidenceRepository repository;

    public EvidenceController(EvidenceRepository repository) {
        this.repository = repository;
    }

    // Save before and after photos for a report
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

    // Compare before and after photos inside the Java backend.
    // No external Flask/CV service is called.
    @PostMapping(
        value = "/compare",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> compareEvidence(
            @RequestParam("beforePhoto") MultipartFile beforePhoto,
            @RequestParam("afterPhoto") MultipartFile afterPhoto)
            throws IOException {

        validateImage(beforePhoto);
        validateImage(afterPhoto);

        BufferedImage before = ImageIO.read(
            new ByteArrayInputStream(beforePhoto.getBytes())
        );

        BufferedImage after = ImageIO.read(
            new ByteArrayInputStream(afterPhoto.getBytes())
        );

        if (before == null || after == null) {
            throw new IllegalArgumentException(
                "Please upload valid image files."
            );
        }

        int width = 200;
        int height = 200;

        BufferedImage beforeSmall = resizeImage(before, width, height);
        BufferedImage afterSmall = resizeImage(after, width, height);

        long changedPixels = 0;
        long totalPixels = (long) width * height;

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {

                int rgb1 = beforeSmall.getRGB(x, y);
                int rgb2 = afterSmall.getRGB(x, y);

                int redDiff = Math.abs(
                    ((rgb1 >> 16) & 255) - ((rgb2 >> 16) & 255)
                );

                int greenDiff = Math.abs(
                    ((rgb1 >> 8) & 255) - ((rgb2 >> 8) & 255)
                );

                int blueDiff = Math.abs(
                    (rgb1 & 255) - (rgb2 & 255)
                );

                if (redDiff + greenDiff + blueDiff > 75) {
                    changedPixels++;
                }
            }
        }

        double changePercent = Math.round(
            changedPixels * 10000.0 / totalPixels
        ) / 100.0;

        Map<String, Object> result = new HashMap<>();
        result.put("change_percent", changePercent);
        result.put("message", "Photo comparison completed.");
        result.put(
            "note",
            "This percentage shows visual differences between photos. "
            + "An authorised officer must verify repair completion."
        );

        return result;
    }

    // Retrieve evidence by report ID
    @GetMapping("/{reportId}")
    public Evidence getEvidence(@PathVariable Integer reportId) {

        List<Evidence> evidenceList = repository.findAll();

        return evidenceList.stream()
            .filter(e -> e.getReportId() != null
                    && e.getReportId().equals(reportId))
            .findFirst()
            .orElse(null);
    }

    private BufferedImage resizeImage(
            BufferedImage original, int width, int height) {

        BufferedImage resized = new BufferedImage(
            width, height, BufferedImage.TYPE_INT_RGB
        );

        Graphics2D graphics = resized.createGraphics();
        graphics.drawImage(original, 0, 0, width, height, null);
        graphics.dispose();

        return resized;
    }

    private void validateImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please select both photos."
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

