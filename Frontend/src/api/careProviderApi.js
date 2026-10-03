import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const careProviderApi = {
  async getProviders() {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/care-providers');
    }
    await simulateDelay();
    return mockStore.getTable('careProviders') || [];
  },

  async getProviderById(providerId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-providers/${providerId}`);
    }
    await simulateDelay();
    return mockStore.getItem('careProviders', 'providerId', providerId);
  },

  async createProvider(providerData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/care-providers', {
        method: 'POST',
        body: JSON.stringify(providerData),
      });
    }
    await simulateDelay(300);
    const providers = mockStore.getTable('careProviders') || [];
    const newId = `PRV-${String(providers.length + 1).padStart(3, '0')}`;
    const newProvider = {
      ...providerData,
      providerId: newId,
      active: true,
    };
    return mockStore.insertItem('careProviders', newProvider);
  },

  async updateProvider(providerId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-providers/${providerId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay(300);
    return mockStore.updateItem('careProviders', 'providerId', providerId, updates);
  },

  async deleteProvider(providerId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-providers/${providerId}`, { method: 'DELETE' });
    }
    await simulateDelay(300);
    return mockStore.deleteItem('careProviders', 'providerId', providerId);
  },

  async activateProvider(providerId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-providers/${providerId}/activate`, { method: 'PUT' });
    }
    await simulateDelay(250);
    return mockStore.updateItem('careProviders', 'providerId', providerId, { active: true });
  },

  async deactivateProvider(providerId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/care-providers/${providerId}/deactivate`, { method: 'PUT' });
    }
    await simulateDelay(250);
    return mockStore.updateItem('careProviders', 'providerId', providerId, { active: false });
  },
};
