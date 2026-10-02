import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const consultationApi = {
  async getConsultations(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/consultations?${params}`);
    }
    await simulateDelay();
    let list = mockStore.getTable('consultations');
    if (filters.petId) {
      list = list.filter((c) => c.petId === filters.petId);
    }
    // Optional caseId filter for rescue animal consultations
    if (filters.caseId) {
      list = list.filter((c) => c.caseId === filters.caseId);
    }
    if (filters.vetId) {
      list = list.filter((c) => c.vetId === filters.vetId);
    }
    return list;
  },

  async getConsultationById(consultationId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/consultations/${consultationId}`);
    await simulateDelay();
    return mockStore.getItem('consultations', 'consultationId', consultationId);
  },

  async createConsultation(consultationData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/consultations', {
        method: 'POST',
        body: JSON.stringify(consultationData),
      });
    }
    await simulateDelay(350);
    const list = mockStore.getTable('consultations');
    const newId = `CNS-2026-${String(list.length + 1).padStart(2, '0')}`;

    const newConsultation = {
      ...consultationData,
      consultationId: newId,
      // Preserve caseId when provided for rescue animals; undefined otherwise
      caseId: consultationData.caseId || null,
      consultationDate: new Date().toISOString(),
    };

    mockStore.insertItem('consultations', newConsultation);

    // If appointment ID was provided, mark appointment completed
    if (consultationData.appointmentId) {
      mockStore.updateItem('appointments', 'appointmentId', consultationData.appointmentId, {
        status: 'Completed',
      });
    }

    return newConsultation;
  }
};
