package com.example.swp.features.file_storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@CrossOrigin(origins = "*")
public class FileStorageController {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

    public FileStorageController() {
        // Set the storage directory to "uploads" in the project root
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("Could not create the upload directory.", ex);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "File size exceeds the 20MB limit"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file name"));
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!extension.equals(".pdf") && !extension.equals(".zip") && !extension.equals(".pptx")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only .pdf, .zip, and .pptx files are allowed"));
        }

        try {
            // Generate a secure UUID filename to prevent path traversal
            String cleanFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(cleanFileName);
            
            // Security check: ensure path is within the storage location
            if (!targetLocation.startsWith(this.fileStorageLocation)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid destination path"));
            }

            Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = "http://localhost:8080/api/v1/files/download/" + cleanFileName;
            
            return ResponseEntity.ok().body(Map.of("url", fileDownloadUri));
        } catch (IOException ex) {
            log.error("Could not store file.", ex);
            return ResponseEntity.status(500).body(Map.of("message", "Could not store file. Please try again."));
        }
    }

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            
            // Security check: prevent directory traversal
            if (!filePath.startsWith(this.fileStorageLocation)) {
                throw new SecurityException("Unauthorized file path access");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException e) {
                    log.warn("Could not determine file content type.");
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            return ResponseEntity.badRequest().build();
        }
    }
}
