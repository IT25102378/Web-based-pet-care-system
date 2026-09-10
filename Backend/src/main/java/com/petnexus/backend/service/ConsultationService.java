package com.petnexus.backend.service;

import com.petnexus.backend.dto.*;
import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Consultation;
import com.petnexus.backend.entity.Pet;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.enums.UserRole;
import com.petnexus.backend.exception.BadRequestException;
import com.petnexus.backend.exception.ResourceNotFoundException;
import com.petnexus.backend.repository.*;
import com.petnexus.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final VaccinationRepository vaccinationRepository;

    // =========================================================================
    // Retrieval Operations
    // =========================================================================

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getConsultations(String petId, String caseId, String vetId, String callerOwnerId) {
        String cleanPetId = (petId != null && !petId.trim().isEmpty()) ? petId.trim() : null;
        String cleanCaseId = (caseId != null && !caseId.trim().isEmpty()) ? caseId.trim() : null;
        String cleanVetId = (vetId != null && !vetId.trim().isEmpty()) ? vetId.trim() : null;

        List<Consultation> list = consultationRepository.findWithFilters(cleanPetId, cleanCaseId, cleanVetId);

        // Ownership filtering: If caller is a Pet Owner, ensure they only see their own pets
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser != null && currentUser.getRole() == UserRole.PetOwner) {
            list = list.stream()
                    .filter(c -> c.getPet() != null && c.getPet().getOwner() != null &&
                            currentUser.getUserId().equalsIgnoreCase(c.getPet().getOwner().getUserId()))
                    .collect(Collectors.toList());
        }

        return list.stream().map(ConsultationResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConsultationResponse getConsultationById(String consultationId, String callerOwnerId) {
        Consultation c = consultationRepository.findByConsultationId(consultationId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with ID: " + consultationId));

        if (c.getPet() != null && c.getPet().getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(c.getPet().getOwner().getUserId(), UserRole.Admin, UserRole.ClinicManager, UserRole.Veterinarian);
        }

        return ConsultationResponse.from(c);
    }

    @Transactional(readOnly = true)
    public List<ConsultationResponse> getRescueCaseConsultations(String caseId) {
        List<Consultation> list = consultationRepository.findByCaseId(caseId.trim());
        return list.stream().map(ConsultationResponse::from).collect(Collectors.toList());
    }

    // =========================================================================
    // Create Consultation (SOAP Record & Appointment Completion)
    // =========================================================================

    @Transactional
    public ConsultationResponse createConsultation(ConsultationRequest request) {
        if (request.getAssessmentDiagnosis() == null || request.getAssessmentDiagnosis().trim().isEmpty()) {
            throw new BadRequestException("Assessment and diagnosis are required.");
        }
        if (request.getTreatmentPlan() == null || request.getTreatmentPlan().trim().isEmpty()) {
            throw new BadRequestException("Treatment plan is required.");
        }

        Appointment appointment = null;
        if (request.getAppointmentId() != null && !request.getAppointmentId().trim().isEmpty()) {
            String apptId = request.getAppointmentId().trim();
            appointment = appointmentRepository.findByAppointmentId(apptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + apptId));

            // Prevent duplicate consultation for the same appointment
            if (consultationRepository.existsByAppointmentId(apptId)) {
                throw new BadRequestException("A consultation has already been recorded for appointment " + apptId);
            }

            // Mark the appointment as Completed
            appointment.setStatus(AppointmentStatus.Completed);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);
            log.info("Appointment {} marked Completed following consultation", apptId);
        }

        Pet pet = null;
        if (request.getPetId() != null && !request.getPetId().trim().isEmpty()) {
            pet = petRepository.findByPetId(request.getPetId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + request.getPetId()));
        }

        User vet = null;
        if (request.getVetId() != null && !request.getVetId().trim().isEmpty()) {
            vet = userRepository.findByUserId(request.getVetId().trim()).orElse(null);
        }

        String newConsultationId = generateConsultationId();
        String petName = (request.getPetName() != null && !request.getPetName().trim().isEmpty())
                ? request.getPetName().trim()
                : (pet != null ? pet.getName() : "Patient");

        String vetName = (request.getVetName() != null && !request.getVetName().trim().isEmpty())
                ? request.getVetName().trim()
                : (vet != null ? vet.getFullName() : "Dr. Michael Chen, DVM");

        Consultation c = Consultation.builder()
                .consultationId(newConsultationId)
                .appointment(appointment)
                .appointmentId(appointment != null ? appointment.getAppointmentId() : request.getAppointmentId())
                .pet(pet)
                .petId(pet != null ? pet.getPetId() : null)
                .petName(petName)
                .caseId(request.getCaseId() != null && !request.getCaseId().trim().isEmpty() ? request.getCaseId().trim() : null)
                .veterinarian(vet)
                .vetId(request.getVetId())
                .vetName(vetName)
                .consultationDate(LocalDateTime.now())
                .temperatureC(request.getTemperatureC())
                .heartRateBpm(request.getHeartRateBpm())
                .respiratoryRateBpm(request.getRespiratoryRateBpm())
                .weightKg(request.getWeightKg())
                .subjectiveNotes(request.getSubjectiveNotes())
                .objectiveFindings(request.getObjectiveFindings())
                .assessmentDiagnosis(request.getAssessmentDiagnosis().trim())
                .treatmentPlan(request.getTreatmentPlan().trim())
                .followUpDate(request.getFollowUpDate())
                .rescueMedicalSummary(request.getRescueMedicalSummary())
                .passToProvider(request.getPassToProvider())
                .status("Completed")
                .build();

        Consultation saved = consultationRepository.save(c);
        log.info("Consultation recorded: {} for patient {}", saved.getConsultationId(), saved.getPetName());
        return ConsultationResponse.from(saved);
    }

    // =========================================================================
    // Unified Medical History
    // =========================================================================

    @Transactional(readOnly = true)
    public MedicalHistoryResponse getPetMedicalHistory(String petId, String callerOwnerId) {
        Pet pet = petRepository.findByPetId(petId.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found with ID: " + petId));

        if (pet.getOwner() != null) {
            SecurityUtils.enforceOwnershipOrRole(pet.getOwner().getUserId(), UserRole.Admin, UserRole.ClinicManager, UserRole.Veterinarian);
        }

        List<ConsultationResponse> consults = consultationRepository.findByPetId(pet.getPetId())
                .stream().map(ConsultationResponse::from).collect(Collectors.toList());

        List<PrescriptionResponse> rxs = prescriptionRepository.findByPetId(pet.getPetId())
                .stream().map(PrescriptionResponse::from).collect(Collectors.toList());

        List<VaccinationResponse> vacs = vaccinationRepository.findByPet_PetId(pet.getPetId())
                .stream().map(VaccinationResponse::from).collect(Collectors.toList());

        return MedicalHistoryResponse.builder()
                .pet(PetResponse.from(pet))
                .consultations(consults)
                .prescriptions(rxs)
                .vaccinations(vacs)
                .build();
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private String generateConsultationId() {
        long count = consultationRepository.count() + 1;
        String candidate;
        do {
            candidate = "CNS-2026-" + String.format("%02d", count++);
        } while (consultationRepository.existsByConsultationId(candidate));
        return candidate;
    }
}
