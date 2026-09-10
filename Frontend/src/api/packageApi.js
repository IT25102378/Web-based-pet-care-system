import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const packageApi = {
  async getPackages() {
    if (!USE_MOCK_DATA) {
      const items = await apiFetch('/packages');
      return (items || []).map((p) => ({
        ...p,
        packageId: p.packageId || p.serviceId,
        features: p.features || (p.description ? [p.description] : []),
      }));
    }
    await simulateDelay();
    return mockStore.getTable('clinicPackages');
  },

  async getPackageById(packageId) {
    if (!USE_MOCK_DATA) {
      const p = await apiFetch(`/packages/${packageId}`);
      if (!p) return null;
      return {
        ...p,
        packageId: p.packageId || p.serviceId,
        features: p.features || (p.description ? [p.description] : []),
      };
    }
    await simulateDelay();
    return mockStore.getItem('clinicPackages', 'packageId', packageId);
  },

  async createPackage(pkgData) {
    if (!USE_MOCK_DATA) {
      const payload = {
        name: pkgData.name,
        description: Array.isArray(pkgData.features) ? pkgData.features.join(', ') : (pkgData.features || pkgData.description || 'Clinic wellness package'),
        price: Number(pkgData.price) || 0,
        durationMinutes: Number(pkgData.durationMinutes) || 60,
      };
      const created = await apiFetch('/packages', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return {
        ...created,
        packageId: created.serviceId || created.packageId,
        features: created.description ? [created.description] : [],
      };
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
      const payload = {
        serviceId: packageId,
        name: updates.name,
        description: Array.isArray(updates.features) ? updates.features.join(', ') : (updates.features || updates.description || ''),
        price: updates.price !== undefined ? Number(updates.price) : undefined,
        durationMinutes: updates.durationMinutes !== undefined ? Number(updates.durationMinutes) : 60,
      };
      const updated = await apiFetch(`/packages/${packageId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return {
        ...updated,
        packageId: updated.serviceId || updated.packageId,
        features: updated.description ? [updated.description] : [],
      };
    }
    await simulateDelay(300);
    return mockStore.updateItem('clinicPackages', 'packageId', packageId, updates);
  }
};
