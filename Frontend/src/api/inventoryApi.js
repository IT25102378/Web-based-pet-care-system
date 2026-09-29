import { USE_MOCK_DATA, simulateDelay, apiFetch } from './client';
import { mockStore } from '../data/mockStore';
import { StockStatus } from '../types';

export const inventoryApi = {
  async getInventory(filters = {}) {
    if (!USE_MOCK_DATA) {
      const params = new URLSearchParams(filters).toString();
      return await apiFetch(`/inventory?${params}`);
    }
    await simulateDelay();
    let items = mockStore.getTable('inventoryItems');
    if (filters.category) {
      items = items.filter((i) => i.category === filters.category);
    }
    if (filters.status) {
      items = items.filter((i) => i.status === filters.status);
    }
    return items;
  },

  async getItemById(itemId) {
    if (!USE_MOCK_DATA) return await apiFetch(`/inventory/${itemId}`);
    await simulateDelay();
    return mockStore.getItem('inventoryItems', 'itemId', itemId);
  },

  async addInventoryItem(itemData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    }
    await simulateDelay(300);
    const items = mockStore.getTable('inventoryItems');
    const newId = `INV-${100 + items.length + 1}`;

    const currentStock = Number(itemData.currentStock) || 0;
    const minThreshold = Number(itemData.minStockThreshold) || 5;

    let status = StockStatus.IN_STOCK;
    if (currentStock === 0) status = StockStatus.OUT_OF_STOCK;
    else if (currentStock <= minThreshold) status = StockStatus.LOW_STOCK;

    const newItem = {
      ...itemData,
      itemId: newId,
      currentStock,
      minStockThreshold: minThreshold,
      status,
    };

    return mockStore.insertItem('inventoryItems', newItem);
  },

  async updateStock(itemId, quantityToAdd, reason = 'Restock') {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/inventory/${itemId}/restock`, {
        method: 'POST',
        body: JSON.stringify({ quantityToAdd, reason }),
      });
    }
    await simulateDelay(300);
    const item = mockStore.getItem('inventoryItems', 'itemId', itemId);
    if (!item) throw new Error('Inventory item not found');

    const newStock = Math.max(0, item.currentStock + Number(quantityToAdd));
    let status = StockStatus.IN_STOCK;
    if (newStock === 0) status = StockStatus.OUT_OF_STOCK;
    else if (newStock <= item.minStockThreshold) status = StockStatus.LOW_STOCK;

    return mockStore.updateItem('inventoryItems', 'itemId', itemId, {
      currentStock: newStock,
      status,
    });
  },

  async updateInventoryItem(itemId, itemData) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/inventory/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(itemData),
      });
    }
    await simulateDelay(250);
    return mockStore.updateItem('inventoryItems', 'itemId', itemId, itemData);
  },

  async deleteInventoryItem(itemId) {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/inventory/${itemId}`, {
        method: 'DELETE',
      });
    }
    await simulateDelay(200);
    return mockStore.deleteItem('inventoryItems', 'itemId', itemId);
  },

  async getLowStockAlerts() {
    if (!USE_MOCK_DATA) return await apiFetch('/inventory/low-stock-alerts');
    await simulateDelay();
    const items = mockStore.getTable('inventoryItems');
    return items.filter((i) => i.currentStock <= i.minStockThreshold);
  },

  async sendRefillAlert(itemId, note = '') {
    if (!USE_MOCK_DATA) {
      return await apiFetch(`/inventory/${itemId}/send-refill-alert`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    }
    await simulateDelay(300);
    const item = mockStore.getItem('inventoryItems', 'itemId', itemId);
    if (!item) throw new Error('Inventory item not found');

    const users = mockStore.getTable('users');
    const staffUsers = users.filter((u) => u.role === 'ClinicStaff');

    const notifs = staffUsers.map((staff, idx) => ({
      notificationId: `NTF-REF-${Date.now()}-${idx}`,
      userId: staff.userId,
      type: 'Inventory',
      title: `Stocks Nearly Over / Finished: ${item.name}`,
      message: `Product '${item.name}' (SKU: ${item.sku}) stocks are ${item.currentStock <= 0 ? 'completely finished (0 remaining)' : 'nearly over (' + item.currentStock + ' ' + item.unit + ' remaining)'}. Stocks are nearly over, so restock the items.${note ? ' Note: ' + note : ''}`,
      link: '/staff/inventory',
      isRead: false,
      createdAt: new Date().toISOString(),
    }));

    notifs.forEach((n) => mockStore.insertItem('notifications', n));
    return {
      success: true,
      message: `Refill alert sent to ${staffUsers.length} clinic staff member(s).`,
      staffNotified: staffUsers.length,
    };
  },

  async sendBulkRefillAlerts() {
    if (!USE_MOCK_DATA) {
      return await apiFetch('/inventory/send-bulk-refill-alerts', {
        method: 'POST',
      });
    }
    await simulateDelay(300);
    const items = mockStore.getTable('inventoryItems');
    const lowStockItems = items.filter((i) => i.currentStock <= i.minStockThreshold);
    if (lowStockItems.length === 0) {
      return { success: true, message: 'No items currently below minimum threshold.', itemsCount: 0 };
    }

    const users = mockStore.getTable('users');
    const staffUsers = users.filter((u) => u.role === 'ClinicStaff');

    const summary = lowStockItems.slice(0, 5).map((it) => `• ${it.name} (${it.currentStock}/${it.minStockThreshold} ${it.unit})`).join('\n');
    const notifs = staffUsers.map((staff, idx) => ({
      notificationId: `NTF-BULK-${Date.now()}-${idx}`,
      userId: staff.userId,
      type: 'Inventory',
      title: `Urgent: ${lowStockItems.length} Item(s) Require Refill`,
      message: `Clinic Manager alert: The following items need restocking:\n${summary}\nPlease restock in the Inventory Manager.`,
      link: '/staff/inventory',
      isRead: false,
      createdAt: new Date().toISOString(),
    }));

    notifs.forEach((n) => mockStore.insertItem('notifications', n));
    return {
      success: true,
      message: `Refill alerts sent for ${lowStockItems.length} low/depleted items to clinic staff.`,
      itemsCount: lowStockItems.length,
    };
  },
};
