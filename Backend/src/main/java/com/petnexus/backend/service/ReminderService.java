package com.petnexus.backend.service;

import com.petnexus.backend.entity.Appointment;
import com.petnexus.backend.entity.Notification;
import com.petnexus.backend.entity.User;
import com.petnexus.backend.entity.Vaccination;
import com.petnexus.backend.enums.AppointmentStatus;
import com.petnexus.backend.patterns.factory.NotificationFactory;
import com.petnexus.backend.repository.AppointmentRepository;
import com.petnexus.backend.repository.NotificationRepository;
import com.petnexus.backend.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled reminders (minor function "Notification and alerts"): vaccination boosters that fall due within
 * the next week and appointments happening tomorrow. Every reminder is built by NotificationFactory and is
 * sent at most once per day (duplicate guard), so running the job twice is harmless.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    static final int VACCINATION_LOOKAHEAD_DAYS = 7;

    private final VaccinationRepository vaccinationRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationFactory notificationFactory;
    private final EmailService emailService;
    private final Clock clock;

    /** Runs every day at 08:00 (cron can be changed with petnexus.reminders.cron). */
    @Scheduled(cron = "${petnexus.reminders.cron:0 0 8 * * *}")
    public void sendDailyReminders() {
        int vaccines = sendVaccinationReminders();
        int visits = sendAppointmentReminders();
        log.info("Daily reminders sent: {} vaccination, {} appointment", vaccines, visits);
    }

    @Transactional
    public int sendVaccinationReminders() {
        LocalDate today = LocalDate.now(clock);
        List<Vaccination> due = vaccinationRepository.findByNextDueDateBetween(today, today.plusDays(VACCINATION_LOOKAHEAD_DAYS));
        int sent = 0;
        for (Vaccination v : due) {
            User owner = v.getPet() != null ? v.getPet().getOwner() : null;
            if (owner == null) {
                continue;
            }
            Notification n = notificationFactory.createVaccinationReminderNotification(
                    owner, v.getPetName() != null ? v.getPetName() : v.getPet().getName(),
                    v.getVaccineName(), String.valueOf(v.getNextDueDate()));
            if (saveOncePerDay(n, today)) {
                sent++;
            }
        }
        return sent;
    }

    @Transactional
    public int sendAppointmentReminders() {
        LocalDate today = LocalDate.now(clock);
        List<Appointment> tomorrow = appointmentRepository.findByAppointmentDateAndStatusIn(
                today.plusDays(1),
                List.of(AppointmentStatus.Scheduled, AppointmentStatus.Confirmed, AppointmentStatus.Pending));
        int sent = 0;
        for (Appointment a : tomorrow) {
            User owner = a.getOwner();
            if (owner == null) {
                continue;
            }
            Notification n = notificationFactory.createAppointmentNotification(
                    owner, a.getAppointmentId(), a.getPetName(), "tomorrow at " + a.getTimeSlot(), "Reminder");
            if (saveOncePerDay(n, today)) {
                emailService.sendNotificationEmail(owner.getEmail(), n.getTitle(), n.getMessage());
                sent++;
            }
        }
        return sent;
    }

    private boolean saveOncePerDay(Notification n, LocalDate today) {
        if (notificationRepository.existsByUserAndTitleAndMessageAndCreatedAtAfter(
                n.getUser(), n.getTitle(), n.getMessage(), today.atStartOfDay())) {
            return false;
        }
        notificationRepository.save(n);
        return true;
    }
}
