import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';

export const supplierApi = {
  async getSuppliers() {
    if (!USE_MOCK_DATA) return await apiFetch('/suppliers');
    await simulateDelay();
    return mockStore.getTable('suppliers');
  },

  async addSupplier(supplierData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });
    }
    await simulateDelay(300);
    const list = mockStore.getTable('suppliers');
    const newId = `SUP-${String(list.length + 1).padStart(2, '0')}`;

    const newSupplier = {
      ...supplierData,
      supplierId: newId,
      leadTimeDays: Number(supplierData.leadTimeDays) >= 0 ? Number(supplierData.leadTimeDays) : 2,
      rating: Number(supplierData.rating) >= 0 ? Math.min(5, Number(supplierData.rating)) : 5.0,
      address: supplierData.address || '',
    };

    return mockStore.insertItem('suppliers', newSupplier);
  },

  async updateSupplier(supplierId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/suppliers/${supplierId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay(250);
    const cleanedUpdates = { ...updates };
    if (cleanedUpdates.rating !== undefined) {
      cleanedUpdates.rating = Math.max(0, Math.min(5, Number(cleanedUpdates.rating) || 5.0));
    }
    if (cleanedUpdates.leadTimeDays !== undefined) {
      cleanedUpdates.leadTimeDays = Math.max(0, Number(cleanedUpdates.leadTimeDays) || 0);
    }
    const updated = mockStore.updateItem('suppliers', 'supplierId', supplierId, cleanedUpdates);

    // If companyName changed, keep supplierName in inventoryItems aligned
    if (updates.companyName) {
      const invItems = mockStore.getTable('inventoryItems');
      let changed = false;
      invItems.forEach((item) => {
        if (item.supplierId === supplierId) {
          item.supplierName = updates.companyName;
          changed = true;
        }
      });
      if (changed) {
        mockStore.setTable('inventoryItems', invItems);
      }
    }

    return updated;
  },

  async deleteSupplier(supplierId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/suppliers/${supplierId}`, {
        method: 'DELETE',
      });
    }
    await simulateDelay(200);
    return mockStore.deleteItem('suppliers', 'supplierId', supplierId);
  },

  async createPurchaseOrder(poData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/suppliers/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(poData),
      });
    }
    await simulateDelay(350);
    // Simulate purchase order placement and notification
    mockStore.insertItem('notifications', {
      notificationId: `NTF-${Date.now()}`,
      userId: 'USR-005', // Manager
      type: 'Inventory',
      title: 'Purchase Order Dispatched',
      message: `PO #${Date.now().toString().slice(-6)} placed with ${poData.supplierName} for $${poData.totalAmount}.`,
      isRead: false,
      link: '/manager/inventory',
      createdAt: new Date().toISOString(),
    });

    return {
      orderId: `PO-${Date.now().toString().slice(-6)}`,
      success: true,
      message: 'Purchase order placed successfully!',
    };
  },

  async getPurchaseOrders(supplierId = null) {
    if (!USE_MOCK_DATA) {
      const url = supplierId ? `/purchase-orders?supplierId=${supplierId}` : '/purchase-orders';
      return await apiFetch(url);
    }
    await simulateDelay();
    let pos = mockStore.getTable('purchaseOrders') || [];
    if (supplierId) pos = pos.filter((p) => p.supplierId === supplierId);
    return pos;
  },

  async getPurchaseOrderById(orderId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/purchase-orders/${orderId}`);
    await simulateDelay();
    return mockStore.getItem('purchaseOrders', 'orderId', orderId);
  },

  async updatePurchaseOrder(orderId, updates) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/purchase-orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    }
    await simulateDelay();
    return mockStore.updateItem('purchaseOrders', 'orderId', orderId, updates);
  },

  async dispatchPurchaseOrder(orderId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/purchase-orders/${orderId}/dispatch`, { method: 'POST' });
    }
    await simulateDelay();
    return mockStore.updateItem('purchaseOrders', 'orderId', orderId, { status: 'Dispatched' });
  },

  async cancelPurchaseOrder(orderId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/purchase-orders/${orderId}`, { method: 'DELETE' });
    }
    await simulateDelay();
    return mockStore.deleteItem('purchaseOrders', 'orderId', orderId);
  }
};

