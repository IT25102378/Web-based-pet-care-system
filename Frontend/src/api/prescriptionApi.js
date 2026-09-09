import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const prescriptionApi = {
  async getPrescriptions(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/prescriptions?${params}`);
    }
    await simulateDelay();
    let rxList = mockStore.getTable('prescriptions');
    if (filters.petId) {
      rxList = rxList.filter((r) => r.petId === filters.petId);
    }
    if (filters.vetId) {
      rxList = rxList.filter((r) => r.vetId === filters.vetId);
    }

    const items = mockStore.getTable('prescriptionItems');
    return rxList.map((rx) => ({
      ...rx,
      items: items.filter((i) => i.prescriptionId === rx.prescriptionId),
    }));
  },

  async getPrescriptionById(prescriptionId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/prescriptions/${prescriptionId}`);
    await simulateDelay();
    const rx = mockStore.getItem('prescriptions', 'prescriptionId', prescriptionId);
    if (!rx) return null;

    const items = mockStore.filterTable('prescriptionItems', (i) => i.prescriptionId === prescriptionId);
    return { ...rx, items };
  },

  async createPrescription(prescriptionData, items = []) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({ prescriptionData, items }),
      });
    }
    await simulateDelay(400);
    const rxList = mockStore.getTable('prescriptions');
    const newRxId = `RX-2026-${String(rxList.length + 1).padStart(3, '0')}`;

    const newRx = {
      ...prescriptionData,
      prescriptionId: newRxId,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };

    mockStore.insertItem('prescriptions', newRx);

    // Save individual medication items
    items.forEach((item, idx) => {
      mockStore.insertItem('prescriptionItems', {
        itemId: `RXI-${Date.now()}-${idx}`,
        prescriptionId: newRxId,
        medicationName: item.medicationName,
        dosage: item.dosage,
        frequency: item.frequency,
        durationDays: Number(item.durationDays) || 7,
        quantityPrescribed: Number(item.quantityPrescribed) || 1,
        refillsAllowed: Number(item.refillsAllowed) || 0,
      });
    });

    return { ...newRx, items };
  }
};
