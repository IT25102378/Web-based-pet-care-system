package com.petnexus.backend.controller;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PetController {

    private final PetService petService;

    // =========================================================================
    // Pet Endpoints
    // =========================================================================

    /** GET /api/pets — All pets or filtered by ownerId (?ownerId=USR-xxx) */
    @GetMapping("/pets")
    public ResponseEntity<List<PetResponse>> getPets(
            @RequestParam(required = false) String ownerId
    ) {
        return ResponseEntity.ok(petService.getAllPets(ownerId));
    }

    /** GET /api/pets/{petId} — Single pet by petId */
    @GetMapping("/pets/{petId}")
    public ResponseEntity<PetResponse> getPetById(@PathVariable String petId) {
        return ResponseEntity.ok(petService.getPetById(petId));
    }

    /** POST /api/pets — Register/create new pet */
    @PostMapping("/pets")
    public ResponseEntity<PetResponse> createPet(@Valid @RequestBody PetRequest request) {
        PetResponse response = petService.createPet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** PUT /api/pets/{petId} — Update existing pet */
    @PutMapping("/pets/{petId}")
    public ResponseEntity<PetResponse> updatePet(
            @PathVariable String petId,
            @Valid @RequestBody PetRequest request
    ) {
        return ResponseEntity.ok(petService.updatePet(petId, request));
    }

    /** DELETE /api/pets/{petId} — Delete pet */
    @DeleteMapping("/pets/{petId}")
    public ResponseEntity<Map<String, Object>> deletePet(@PathVariable String petId) {
        petService.deletePet(petId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Pet deleted successfully"));
    }

    // =========================================================================
    // Vaccination Endpoints
    // =========================================================================

    /** GET /api/vaccinations — All vaccinations or filtered by petId (?petId=PET-xxx) */
    @GetMapping("/vaccinations")
    public ResponseEntity<List<VaccinationResponse>> getVaccinations(
            @RequestParam(required = false) String petId
    ) {
        return ResponseEntity.ok(petService.getVaccinations(petId));
    }

    /** POST /api/vaccinations — Add vaccination record */
    @PostMapping("/vaccinations")
    public ResponseEntity<VaccinationResponse> addVaccination(@Valid @RequestBody VaccinationRequest request) {
        VaccinationResponse response = petService.addVaccination(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // =========================================================================
    // Pet Document Endpoints
    // =========================================================================

    /** GET /api/pet-documents — All documents or filtered by petId/ownerId */
    @GetMapping("/pet-documents")
    public ResponseEntity<List<PetDocumentResponse>> getPetDocuments(
            @RequestParam(required = false) String petId,
            @RequestParam(required = false) String ownerId
    ) {
        return ResponseEntity.ok(petService.getPetDocuments(petId, ownerId));
    }

    /** GET /api/pet-documents/{documentId} — Single pet document */
    @GetMapping("/pet-documents/{documentId}")
    public ResponseEntity<PetDocumentResponse> getPetDocumentById(@PathVariable String documentId) {
        return ResponseEntity.ok(petService.getPetDocumentById(documentId));
    }

    /** POST /api/pet-documents — Upload/create pet document */
    @PostMapping("/pet-documents")
    public ResponseEntity<PetDocumentResponse> uploadPetDocument(@Valid @RequestBody PetDocumentRequest request) {
        PetDocumentResponse response = petService.uploadPetDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** DELETE /api/pet-documents/{documentId} — Delete pet document */
    @DeleteMapping("/pet-documents/{documentId}")
    public ResponseEntity<Map<String, Object>> deletePetDocument(@PathVariable String documentId) {
        petService.deletePetDocument(documentId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Document deleted successfully"));
    }
}
