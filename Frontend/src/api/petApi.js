import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const petApi = {
  async getPets(ownerId = null) {
    if (!USE_MOCK_DATA) {
      const url = ownerId ? `/pets?ownerId=${ownerId}` : '/pets';
      return await apiFetch(url);
    }
    await simulateDelay();
    let pets = mockStore.getTable('pets');
    if (ownerId) {
      pets = pets.filter((p) => p.ownerId === ownerId);
    }
    return pets;
  },

  async getPetById(petId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/pets/${petId}`);
    await simulateDelay();
    return mockStore.getItem('pets', 'petId', petId);
  },

  async createPet(petData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/pets', {
        method: 'POST',
        body: JSON.stringify(petData),
      });
    }
    await simulateDelay(300);
    const pets = mockStore.getTable('pets');
    const newPetId = `PET-${String(pets.length + 1).padStart(3, '0')}`;
    const newPet = {
      ...petData,
      petId: newPetId,
      createdAt: new Date().toISOString(),
    };
    return mockStore.insertItem('pets', newPet);
  },

  async updatePet(petId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/pets/${petId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay(300);
    return mockStore.updateItem('pets', 'petId', petId, updates);
  },

  async deletePet(petId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/pets/${petId}`, { method: 'DELETE' });
    }
    await simulateDelay(300);
    return mockStore.deleteItem('pets', 'petId', petId);
  },

  async getVaccinations(petId = null) {
    if (!USE_MOCK_DATA) {
      const url = petId ? `/vaccinations?petId=${petId}` : '/vaccinations';
      return await apiFetch(url);
    }
    await simulateDelay();
    let vacs = mockStore.getTable('vaccinations');
    if (petId) {
      vacs = vacs.filter((v) => v.petId === petId);
    }
    return vacs;
  },

  async addVaccination(vaccineData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/vaccinations', {
        method: 'POST',
        body: JSON.stringify(vaccineData),
      });
    }
    await simulateDelay(300);
    const vacs = mockStore.getTable('vaccinations');
    const newVacId = `VAC-${String(vacs.length + 1).padStart(3, '0')}`;
    const newRecord = {
      ...vaccineData,
      vaccineId: newVacId,
      status: 'Up-to-Date',
    };
    return mockStore.insertItem('vaccinations', newRecord);
  },

  async getPetDocuments(petId = null, ownerId = null) {
    if (!USE_MOCK_DATA) {
      let url = '/pet-documents';
      const params = new URLSearchParams();
      if (petId) params.append('petId', petId);
      if (ownerId) params.append('ownerId', ownerId);
      const query = params.toString();
      if (query) url += `?${query}`;
      return await apiFetch(url);
    }
    await simulateDelay();
    let docs = mockStore.getTable('petDocuments');
    if (petId) {
      docs = docs.filter((d) => d.petId === petId);
    }
    if (ownerId) {
      docs = docs.filter((d) => d.ownerId === ownerId);
    }
    return docs;
  },

  async getPetDocumentById(documentId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/pet-documents/${documentId}`);
    await simulateDelay();
    return mockStore.getItem('petDocuments', 'documentId', documentId);
  },

  async uploadPetDocument(documentData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/pet-documents', {
        method: 'POST',
        body: JSON.stringify(documentData),
      });
    }
    await simulateDelay(300);
    const docs = mockStore.getTable('petDocuments');
    const newDocId = `DOC-${String(docs.length + 101).padStart(3, '0')}`;
    const newDoc = {
      ...documentData,
      documentId: newDocId,
      uploadedAt: new Date().toISOString(),
    };
    return mockStore.insertItem('petDocuments', newDoc);
  },

  async deletePetDocument(documentId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/pet-documents/${documentId}`, { method: 'DELETE' });
    }
    await simulateDelay(300);
    return mockStore.deleteItem('petDocuments', 'documentId', documentId);
  },

  async getMedicalHistory(petId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/pets/${petId}/medical-history`);
    }
    await simulateDelay();
    const consultations = mockStore.filterTable('consultations', (c) => c.petId === petId);
    const prescriptions = mockStore.filterTable('prescriptions', (p) => p.petId === petId);
    const vaccinations = mockStore.filterTable('vaccinations', (v) => v.petId === petId);
    return { petId, consultations, prescriptions, vaccinations };
  }
};

