import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const packageApi = {
  async getPackages() {
    if (!USE_MOCK_DATA) return await apiFetch('/packages');
    await simulateDelay();
    return mockStore.getTable('clinicPackages');
  },

  async getPackageById(packageId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/packages/${packageId}`);
    await simulateDelay();
    return mockStore.getItem('clinicPackages', 'packageId', packageId);
  },

  async createPackage(pkgData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/packages', {
        method: 'POST',
        body: JSON.stringify(pkgData),
      });
    }
    await simulateDelay(300);
    const pkgs = mockStore.getTable('clinicPackages');
    const newId = `PKG-${String(pkgs.length + 1).padStart(2, '0')}`;

    const newPkg = {
      ...pkgData,
      packageId: newId,
      price: Number(pkgData.price) || 0,
      originalValue: Number(pkgData.originalValue) || 0,
      discountPercent: Number(pkgData.discountPercent) || 0,
      features: Array.isArray(pkgData.features) ? pkgData.features : (pkgData.features || '').split('\n').filter(Boolean),
    };

    return mockStore.insertItem('clinicPackages', newPkg);
  },

  async updatePackage(packageId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay(300);
    return mockStore.updateItem('clinicPackages', 'packageId', packageId, updates);
  }
};
