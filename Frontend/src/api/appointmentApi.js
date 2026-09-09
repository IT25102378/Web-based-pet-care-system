import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { AppointmentStatus } from '../types';

export const appointmentApi = {
  async getAppointments(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/appointments?${params}`);
    }
    await simulateDelay();
    let appointments = mockStore.getTable('appointments');
    if (filters.ownerId) {
      appointments = appointments.filter((a) => a.ownerId === filters.ownerId);
    }
    if (filters.vetId) {
      appointments = appointments.filter((a) => a.vetId === filters.vetId);
    }
    if (filters.status) {
      appointments = appointments.filter((a) => a.status === filters.status);
    }
    if (filters.date) {
      appointments = appointments.filter((a) => a.appointmentDate === filters.date);
    }
    return appointments;
  },

  async getAppointmentById(appointmentId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/appointments/${appointmentId}`);
    await simulateDelay();
    return mockStore.getItem('appointments', 'appointmentId', appointmentId);
  },

  async bookAppointment(bookingData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
    }
    await simulateDelay(350);
    const appointments = mockStore.getTable('appointments');
    const newId = `APT-${1000 + appointments.length + 1}`;
    const token = `A-${String(appointments.length + 1).padStart(2, '0')}`;

    const newAppointment = {
      ...bookingData,
      appointmentId: newId,
      status: AppointmentStatus.SCHEDULED,
      tokenNumber: token,
      createdAt: new Date().toISOString(),
    };

    mockStore.insertItem('appointments', newAppointment);

    // Create notification for pet owner
    if (bookingData.ownerId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: bookingData.ownerId,
        type: 'Appointment',
        title: 'Appointment Confirmed',
        message: `Your appointment for ${bookingData.petName} on ${bookingData.appointmentDate} at ${bookingData.timeSlot} is confirmed.`,
        isRead: false,
        link: '/owner/appointments',
        createdAt: new Date().toISOString(),
      });
    }

    return newAppointment;
  },

  async registerWalkIn(walkInData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/appointments/walk-in', {
        method: 'POST',
        body: JSON.stringify(walkInData),
      });
    }
    await simulateDelay(300);
    const appointments = mockStore.getTable('appointments');
    const newId = `APT-${1000 + appointments.length + 1}`;
    const token = `W-${String(appointments.filter((a) => a.tokenNumber?.startsWith('W')).length + 1).padStart(2, '0')}`;

    const newAppointment = {
      ...walkInData,
      appointmentId: newId,
      status: AppointmentStatus.CHECKED_IN,
      tokenNumber: token,
      createdAt: new Date().toISOString(),
    };

    return mockStore.insertItem('appointments', newAppointment);
  },

  async updateStatus(appointmentId, status) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/appointments/${appointmentId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    }
    await simulateDelay(250);
    return mockStore.updateItem('appointments', 'appointmentId', appointmentId, { status });
  },

  async confirmAppointment(appointmentId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/appointments/${appointmentId}/confirm`, {
        method: 'PUT',
      });
    }
    await simulateDelay(250);
    const appt = mockStore.getItem('appointments', 'appointmentId', appointmentId);
    if (!appt) {
      throw new Error('Appointment not found.');
    }
    if (appt.status !== AppointmentStatus.PENDING && appt.status !== 'Pending') {
      throw new Error(`Appointments with status "${appt.status}" cannot be confirmed.`);
    }

    const updated = mockStore.updateItem('appointments', 'appointmentId', appointmentId, {
      status: AppointmentStatus.CONFIRMED,
      updatedAt: new Date().toISOString(),
    });

    if (appt.ownerId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: appt.ownerId,
        type: 'Appointment',
        title: 'Appointment Confirmed',
        message: `Your appointment for ${appt.petName} on ${appt.appointmentDate} at ${appt.timeSlot} has been confirmed by the clinic.`,
        isRead: false,
        link: '/owner/appointments',
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  },

  async rescheduleAppointment(appointmentId, { newDate, newTimeSlot, newVetName, newVetId, rescheduleReason = '' }) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/appointments/${appointmentId}/reschedule`, {
        method: 'PUT',
        body: JSON.stringify({
          appointmentDate: newDate,
          timeSlot: newTimeSlot,
          vetName: newVetName,
          vetId: newVetId,
          rescheduleReason,
        }),
      });
    }

    await simulateDelay(350);
    const appt = mockStore.getItem('appointments', 'appointmentId', appointmentId);
    if (!appt) {
      throw new Error('Appointment not found.');
    }

    // Validation: Only allow rescheduling for eligible statuses
    const eligibleStatuses = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING, 'Scheduled', 'Confirmed', 'Pending'];
    if (!eligibleStatuses.includes(appt.status)) {
      throw new Error(`Appointments with status "${appt.status}" cannot be rescheduled.`);
    }

    // Validation: Check if new date is in the past
    const today = new Date().toISOString().split('T')[0];
    if (newDate < today) {
      throw new Error('Cannot reschedule an appointment to a date in the past.');
    }

    const effectiveVetName = newVetName || appt.vetName;
    const effectiveVetId = newVetId || appt.vetId;

    // Conflict Check: Prevent double-booking for the same vet, date, and slot
    const allAppointments = mockStore.getTable('appointments');
    const hasConflict = allAppointments.some((a) => {
      if (String(a.appointmentId) === String(appointmentId)) return false;
      if (a.status === AppointmentStatus.CANCELLED || a.status === 'Cancelled' || a.status === AppointmentStatus.NO_SHOW || a.status === 'NoShow') return false;
      const sameDate = a.appointmentDate === newDate;
      const sameSlot = a.timeSlot === newTimeSlot;
      const sameVet = (effectiveVetId && a.vetId === effectiveVetId) || a.vetName === effectiveVetName;
      return sameDate && sameSlot && sameVet;
    });

    if (hasConflict) {
      throw new Error(`The selected time slot (${newTimeSlot}) on ${newDate} is already booked with ${effectiveVetName}. Please choose a different time or doctor.`);
    }

    const updated = mockStore.updateItem('appointments', 'appointmentId', appointmentId, {
      appointmentDate: newDate,
      timeSlot: newTimeSlot,
      vetName: effectiveVetName,
      vetId: effectiveVetId,
      rescheduledFrom: {
        date: appt.appointmentDate,
        timeSlot: appt.timeSlot,
        vetName: appt.vetName,
      },
      rescheduleReason: rescheduleReason || null,
      updatedAt: new Date().toISOString(),
    });

    // In-app notification
    if (appt.ownerId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: appt.ownerId,
        type: 'Appointment',
        title: 'Appointment Rescheduled',
        message: `Your visit for ${appt.petName} has been rescheduled to ${newDate} at ${newTimeSlot} with ${effectiveVetName}.`,
        isRead: false,
        link: '/owner/appointments',
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  },

  async cancelAppointment(appointmentId, { cancellationReason = '' } = {}) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/appointments/${appointmentId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ cancellationReason }),
      });
    }

    await simulateDelay(300);
    const appt = mockStore.getItem('appointments', 'appointmentId', appointmentId);
    if (!appt) {
      throw new Error('Appointment not found.');
    }

    // Validation: Check if already cancelled
    if (appt.status === AppointmentStatus.CANCELLED || appt.status === 'Cancelled') {
      throw new Error('This appointment has already been cancelled.');
    }

    // Validation: Check if already completed or in progress
    if (appt.status === AppointmentStatus.COMPLETED || appt.status === 'Completed' || appt.status === AppointmentStatus.IN_ROOM || appt.status === 'InRoom') {
      throw new Error(`Cannot cancel an appointment with status "${appt.status}".`);
    }

    const updated = mockStore.updateItem('appointments', 'appointmentId', appointmentId, {
      status: AppointmentStatus.CANCELLED,
      cancellationReason: cancellationReason || 'Cancelled by Pet Owner',
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // In-app notification
    if (appt.ownerId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: appt.ownerId,
        type: 'Appointment',
        title: 'Appointment Cancelled',
        message: `Your visit for ${appt.petName} originally scheduled for ${appt.appointmentDate} at ${appt.timeSlot} has been cancelled.`,
        isRead: false,
        link: '/owner/appointments',
        createdAt: new Date().toISOString(),
      });
    }

    return updated;
  },

  async getAvailableSlots(vetName, date, excludeAppointmentId = null) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams({ vetName, date });
      if (excludeAppointmentId) params.append('excludeId', excludeAppointmentId);
      return await apiFetch(`/appointments/available-slots?${params}`);
    }

    await simulateDelay(150);
    const standardSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
      '04:30 PM',
    ];

    const appointments = mockStore.getTable('appointments');
    const bookedSlots = new Set();

    appointments.forEach((a) => {
      if (excludeAppointmentId && String(a.appointmentId) === String(excludeAppointmentId)) return;
      if (a.status === AppointmentStatus.CANCELLED || a.status === 'Cancelled' || a.status === AppointmentStatus.NO_SHOW || a.status === 'NoShow') return;
      if (a.appointmentDate === date && (!vetName || a.vetName === vetName)) {
        bookedSlots.add(a.timeSlot);
      }
    });

    return standardSlots.map((slot) => ({
      timeSlot: slot,
      isAvailable: !bookedSlots.has(slot),
    }));
  }
};
