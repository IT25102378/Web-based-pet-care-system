import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { AdoptionApplicationStatus, RescueCaseStatus } from '../types';

export const adoptionApi = {
  async getAdoptionApplications(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/adoptions/applications?${params}`);
    }
    await simulateDelay();
    let apps = mockStore.getTable('adoptionApplications');
    if (filters.applicantId) {
      apps = apps.filter((a) => a.applicantId === filters.applicantId);
    }
    if (filters.status) {
      apps = apps.filter((a) => a.status === filters.status);
    }
    if (filters.caseId) {
      apps = apps.filter((a) => a.caseId === filters.caseId);
    }

    const docs = mockStore.getTable('adoptionApplicationDocuments');
    return apps.map((app) => ({
      ...app,
      documents: docs.filter((d) => d.applicationId === app.applicationId),
    }));
  },

  async getApplicationById(applicationId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/adoptions/applications/${applicationId}`);
    await simulateDelay();
    const app = mockStore.getItem('adoptionApplications', 'applicationId', applicationId);
    if (!app) return null;

    const docs = mockStore.filterTable('adoptionApplicationDocuments', (d) => d.applicationId === applicationId);
    const rescueCase = mockStore.getItem('rescueCases', 'caseId', app.caseId);

    return {
      ...app,
      documents: docs,
      rescueCase,
    };
  },

  async submitApplication(applicationData, uploadedDocs = []) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/adoptions/applications', {
        method: 'POST',
        body: JSON.stringify({ applicationData, documents: uploadedDocs }),
      });
    }
    await simulateDelay(500);
    const apps = mockStore.getTable('adoptionApplications');
    const newAppId = `ADP-APP-2026-${String(apps.length + 1).padStart(2, '0')}`;

    const newApplication = {
      ...applicationData,
      applicationId: newAppId,
      status: AdoptionApplicationStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
    };

    mockStore.insertItem('adoptionApplications', newApplication);

    // Save uploaded verification documents
    uploadedDocs.forEach((doc, idx) => {
      mockStore.insertItem('adoptionApplicationDocuments', {
        docId: `AAD-${Date.now()}-${idx}`,
        applicationId: newAppId,
        documentType: doc.documentType || 'Proof Document',
        fileName: doc.fileName || doc.name,
        fileUrl: doc.fileUrl || doc.url,
        fileSize: doc.fileSize || doc.size || '1.0 MB',
        uploadedAt: new Date().toISOString(),
      });
    });

    // Notify Rescue Officer
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId: 'USR-006', // Rescue Officer
      type: 'Adoption',
      title: 'New Adoption Application',
      message: `${applicationData.applicantName} submitted an adoption application for ${applicationData.petName}.`,
      isRead: false,
      link: '/rescue/applications',
      createdAt: new Date().toISOString(),
    });

    // Notify Pet Owner confirmation
    if (applicationData.applicantId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now() + 1}`,
        userId: applicationData.applicantId,
        type: 'Adoption',
        title: 'Adoption Application Received',
        message: `Your adoption application for ${applicationData.petName} (Ref: ${newAppId}) has been received!`,
        isRead: false,
        link: '/owner/adopt',
        createdAt: new Date().toISOString(),
      });
    }

    return newApplication;
  },

  async reviewApplication(applicationId, { status, reviewNotes, reviewedBy }) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/adoptions/applications/${applicationId}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewNotes, reviewedBy }),
      });
    }
    await simulateDelay(350);
    const app = mockStore.getItem('adoptionApplications', 'applicationId', applicationId);
    if (!app) throw new Error('Application not found');

    const updatedApp = mockStore.updateItem('adoptionApplications', 'applicationId', applicationId, {
      status,
      reviewNotes,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
    });

    // If approved, update rescue case status to Adopted and create AdoptionRecord
    if (status === AdoptionApplicationStatus.APPROVED) {
      mockStore.updateItem('rescueCases', 'caseId', app.caseId, {
        status: RescueCaseStatus.ADOPTED,
        isPublishedForAdoption: false,
      });

      mockStore.insertItem('adoptionRecords', {
        adoptionRecordId: `ADR-${Date.now()}`,
        applicationId,
        caseId: app.caseId,
        petName: app.petName,
        adopterName: app.applicantName,
        adopterPhone: app.applicantPhone,
        finalizedDate: new Date().toISOString().split('T')[0],
        adoptionFee: 150.00,
        rescueOfficerId: reviewedBy || 'USR-006',
        postAdoptionCheckupDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        checkupStatus: 'Scheduled 30-Day Checkup',
      });

      mockStore.insertItem('rescueProgressLogs', {
        logId: `RPL-${Date.now()}`,
        caseId: app.caseId,
        loggedBy: reviewedBy || 'Rescue Officer',
        logDate: new Date().toISOString(),
        logType: 'Milestone',
        title: `Adoption Finalized with ${app.applicantName}`,
        notes: `Application ${applicationId} approved. Contract signed and pet transferred to loving forever home.`,
      });
    }

    // Notify Applicant
    if (app.applicantId) {
      mockStore.insertItem('notifications', {
        notificationId: `NTF-${Date.now()}`,
        userId: app.applicantId,
        type: 'Adoption',
        title: `Adoption Application ${status}`,
        message: status === AdoptionApplicationStatus.APPROVED
          ? `Congratulations! Your adoption application for ${app.petName} has been approved!`
          : `Update regarding your adoption application for ${app.petName}: ${reviewNotes || 'Criteria not met.'}`,
        isRead: false,
        link: '/owner/adopt',
        createdAt: new Date().toISOString(),
      });
    }

    return updatedApp;
  },

  async getAdoptionRecords() {
    if (!USE_MOCK_DATA) return await apiFetch('/adoptions/records');
    await simulateDelay();
    return mockStore.getTable('adoptionRecords');
  }
};
