import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

const parseFeatures = (desc, feats) => {
  if (Array.isArray(feats) && feats.length > 0) return feats;
  if (!desc) return [];
  return desc.split(/[\r\n,]+/).map((s) => s.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
};

export const packageApi = {
  async getPackages() {
    if (!USE_MOCK_DATA) {
      const items = await apiFetch('/packages');
      return (items || []).map((p) => ({
        ...p,
        packageId: p.packageId || p.serviceId,
        features: parseFeatures(p.description, p.features),
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
        features: parseFeatures(p.description, p.features),
      };
    }
    await simulateDelay();
    return mockStore.getItem('clinicPackages', 'packageId', packageId);
  },

  async createPackage(pkgData) {
    if (!USE_MOCK_DATA) {
      let desc = 'Clinic wellness package';
      if (Array.isArray(pkgData.features)) {
        desc = pkgData.features.join(', ');
      } else if (typeof pkgData.features === 'string' && pkgData.features.trim()) {
        desc = pkgData.features.split('\n').map((s) => s.trim()).filter(Boolean).join(', ');
      } else if (pkgData.description) {
        desc = pkgData.description;
      }

      const payload = {
        name: pkgData.name,
        description: desc,
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
        features: parseFeatures(created.description, created.features),
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
      let desc = undefined;
      if (updates.features !== undefined) {
        if (Array.isArray(updates.features)) {
          desc = updates.features.join(', ');
        } else if (typeof updates.features === 'string') {
          desc = updates.features.split('\n').map((s) => s.trim()).filter(Boolean).join(', ');
        }
      } else if (updates.description) {
        desc = updates.description;
      }

      const payload = {
        serviceId: packageId,
        name: updates.name,
        description: desc,
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
        features: parseFeatures(updated.description, updated.features),
      };
    }
    await simulateDelay(300);
    return mockStore.updateItem('clinicPackages', 'packageId', packageId, updates);
  },

  async togglePackageStatus(packageId, activate) {
    if (!USE_MOCK_DATA) {
      const endpoint = activate ? `/packages/${packageId}/activate` : `/packages/${packageId}/deactivate`;
      return await apiFetch(endpoint, { method: 'PUT' });
    }
    await simulateDelay(200);
    return mockStore.updateItem('clinicPackages', 'packageId', packageId, { active: activate });
  }
};
