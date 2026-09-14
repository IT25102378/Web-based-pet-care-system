import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { RescueCaseStatus } from '../types';

// State machine: each status maps to the set of statuses it may legally transition TO.
// A status not listed here can go to itself (no-op) but not to an unlisted target.
const ALLOWED_TRANSITIONS = {
  [RescueCaseStatus.INTAKE]:             [RescueCaseStatus.IN_TREATMENT, RescueCaseStatus.READY_FOR_FOSTER, RescueCaseStatus.CLOSED],
  [RescueCaseStatus.IN_TREATMENT]:       [RescueCaseStatus.READY_FOR_FOSTER, RescueCaseStatus.CLOSED],
  [RescueCaseStatus.READY_FOR_FOSTER]:   [RescueCaseStatus.IN_FOSTER, RescueCaseStatus.READY_FOR_ADOPTION, RescueCaseStatus.IN_TREATMENT, RescueCaseStatus.CLOSED],
  [RescueCaseStatus.IN_FOSTER]:          [RescueCaseStatus.READY_FOR_ADOPTION, RescueCaseStatus.READY_FOR_FOSTER, RescueCaseStatus.CLOSED],
  [RescueCaseStatus.READY_FOR_ADOPTION]: [RescueCaseStatus.ADOPTED, RescueCaseStatus.IN_FOSTER, RescueCaseStatus.CLOSED],
  [RescueCaseStatus.ADOPTED]:            [RescueCaseStatus.CLOSED],
  [RescueCaseStatus.CLOSED]:             [],
};

const STATUS_LABELS = {
  [RescueCaseStatus.INTAKE]:             'Intake Assessment',
  [RescueCaseStatus.IN_TREATMENT]:       'In Medical Treatment',
  [RescueCaseStatus.READY_FOR_FOSTER]:   'Ready for Foster',
  [RescueCaseStatus.IN_FOSTER]:          'In Foster Care',
  [RescueCaseStatus.READY_FOR_ADOPTION]: 'Ready for Adoption',
  [RescueCaseStatus.ADOPTED]:            'Adopted',
  [RescueCaseStatus.CLOSED]:             'Closed',
};

export const rescueApi = {
  async getRescueCases(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/rescue/cases?${params}`);
    }
    await simulateDelay();
    let cases = mockStore.getTable('rescueCases');
    if (filters.status) {
      cases = cases.filter((c) => c.status === filters.status);
    }
    if (filters.publishedOnly) {
      cases = cases.filter((c) => c.isPublishedForAdoption === true && c.status === RescueCaseStatus.READY_FOR_ADOPTION);
    }
    return cases;
  },

  async getRescueCaseById(caseId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/rescue/cases/${caseId}`);
    await simulateDelay();
    const rescueCase = mockStore.getItem('rescueCases', 'caseId', caseId);
    if (!rescueCase) return null;

    const logs = mockStore.filterTable('rescueProgressLogs', (l) => l.caseId === caseId);
    const photos = mockStore.filterTable('rescuePhotos', (p) => p.caseId === caseId);

    return {
      ...rescueCase,
      progressLogs: logs.sort((a, b) => new Date(b.logDate) - new Date(a.logDate)),
      photos,
    };
  },

  async createRescueCase(caseData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/rescue/cases', {
        method: 'POST',
        body: JSON.stringify(caseData),
      });
    }
    await simulateDelay(350);
    const cases = mockStore.getTable('rescueCases');
    const caseIndex = cases.length + 1;
    const newCaseId = `RSC-2026-${String(caseIndex).padStart(3, '0')}`;
    const newCaseNumber = `RC-2026-${String(caseIndex).padStart(2, '0')}`;

    const newCase = {
      ...caseData,
      caseId: newCaseId,
      caseNumber: newCaseNumber,
      status: caseData.status || RescueCaseStatus.INTAKE,
      isPublishedForAdoption: false,
      createdAt: new Date().toISOString(),
    };

    mockStore.insertItem('rescueCases', newCase);

    // Add initial intake log
    mockStore.insertItem('rescueProgressLogs', {
      logId: `RPL-${Date.now()}`,
      caseId: newCaseId,
      loggedBy: caseData.intakeOfficer || 'Rescue Officer',
      logDate: new Date().toISOString(),
      logType: 'Intake',
      title: 'Initial Rescue Intake Registration',
      notes: `Rescued at ${caseData.rescueLocation}. Initial condition assessed as ${caseData.conditionSeverity || 'Moderate'}.`,
    });

    if (caseData.coverPhotoUrl) {
      mockStore.insertItem('rescuePhotos', {
        photoId: `RPH-${Date.now()}`,
        caseId: newCaseId,
        photoUrl: caseData.coverPhotoUrl,
        caption: 'Intake Photo',
        uploadedAt: new Date().toISOString(),
        tag: 'Intake Evidence',
      });
    }

    return newCase;
  },

  async updateRescueCase(caseId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/rescue/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay(250);

    const currentCase = mockStore.getItem('rescueCases', 'caseId', caseId);

    // ── State machine transition guard ─────────────────────────────────────
    if (updates.status && currentCase && updates.status !== currentCase.status) {
      const allowed = ALLOWED_TRANSITIONS[currentCase.status] || [];
      if (!allowed.includes(updates.status)) {
        const fromLabel = STATUS_LABELS[currentCase.status] || currentCase.status;
        const toLabel   = STATUS_LABELS[updates.status]    || updates.status;
        throw new Error(
          `Invalid status transition: "${fromLabel}" → "${toLabel}". ` +
          `Please follow the required rescue workflow progression.`
        );
      }
    }

    // ── Business-rule: publication requires ReadyForAdoption status ────────
    if (updates.isPublishedForAdoption === true) {
      const effectiveStatus = updates.status || (currentCase ? currentCase.status : null);
      if (effectiveStatus !== RescueCaseStatus.READY_FOR_ADOPTION) {
        throw new Error(
          'Only rescue cases marked Ready for Adoption can be published to the public gallery.'
        );
      }
    }

    return mockStore.updateItem('rescueCases', 'caseId', caseId, updates);
  },

  async addProgressLog(caseId, logData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/rescue/cases/${caseId}/logs`, {
        method: 'POST',
        body: JSON.stringify(logData),
      });
    }
    await simulateDelay(300);
    const newLog = {
      ...logData,
      logId: `RPL-${Date.now()}`,
      caseId,
      logDate: new Date().toISOString(),
    };
    return mockStore.insertItem('rescueProgressLogs', newLog);
  },

  async addPhoto(caseId, photoData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/rescue/cases/${caseId}/photos`, {
        method: 'POST',
        body: JSON.stringify(photoData),
      });
    }
    await simulateDelay(300);
    const newPhoto = {
      ...photoData,
      photoId: `RPH-${Date.now()}`,
      caseId,
      uploadedAt: new Date().toISOString(),
    };
    return mockStore.insertItem('rescuePhotos', newPhoto);
  },

  async getFosterRecords() {
    if (!USE_MOCK_DATA) return await apiFetch('/rescue/fosters');
    await simulateDelay();
    return mockStore.getTable('fosterRecords');
  },

  async assignFoster(caseId, fosterId, fosterName) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/rescue/cases/${caseId}/foster`, {
        method: 'POST',
        body: JSON.stringify({ fosterId, fosterName }),
      });
    }
    await simulateDelay(300);
    mockStore.updateItem('rescueCases', 'caseId', caseId, {
      status: RescueCaseStatus.IN_FOSTER,
      fosterParentId: fosterId,
      fosterParentName: fosterName,
    });

    mockStore.insertItem('rescueProgressLogs', {
      logId: `RPL-${Date.now()}`,
      caseId,
      loggedBy: 'David Thorne (Rescue Officer)',
      logDate: new Date().toISOString(),
      logType: 'Foster',
      title: `Placed in Foster Care with ${fosterName}`,
      notes: `Pet placed into foster care home. Foster monitoring protocol active.`,
    });

    return true;
  },

  // ── Cross-module helpers (Task 6B) ────────────────────────────────────────
  // These allow future Vet/Provider UI tasks to retrieve clinical and care
  // records linked to a rescue case without directly coupling those modules.

  async getRescueCaseConsultations(caseId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/rescue/cases/${caseId}/consultations`);
    await simulateDelay();
    return mockStore.filterTable('consultations', (c) => c.caseId === caseId);
  },

  async getRescueCareLogs(caseId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/care-services/logs?caseId=${caseId}`);
    await simulateDelay();
    return mockStore.filterTable('careServiceLogs', (l) => l.caseId === caseId);
  }
};
