import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Package, Plus, RefreshCw, AlertTriangle, Check, ArrowRight } from 'lucide-react';

export const InventoryPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'Pharmaceuticals',
    sku: 'MED-NEW-001',
    batchNumber: 'BT-2026-01',
    currentStock: 25,
    minStockThreshold: 10,
    unit: 'Bottles',
    unitPrice: 9500.00,
    sellingPrice: 15000.00,
    expiryDate: '2028-06-30',
    supplierName: 'Zoetis Animal Health',
  });

  const loadInventory = async () => {
    try {
      const list = await inventoryApi.getInventory();
      setItems(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleRestockSubmit = async () => {
    if (!restockItem || restockQty <= 0) return;
    try {
      await inventoryApi.updateStock(restockItem.itemId, restockQty, 'Manager Direct Restock');
      showToast('Stock Replenished', `Added ${restockQty} units to ${restockItem.name}`, 'success');
      setRestockItem(null);
      loadInventory();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.sku) {
      showToast('Validation Error', 'Item name and SKU are required.', 'error');
      return;
    }
    try {
      await inventoryApi.addInventoryItem(newItemData);
      showToast('Item Created', `${newItemData.name} added to pharmacy inventory.`, 'success');
      setIsAddModalOpen(false);
      loadInventory();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Item SKU',
      key: 'sku',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.sku}</span>,
    },
    {
      header: 'Product Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.name}</div>
          <div className="text-xs text-muted">Batch: {row.batchNumber} • Supplier: {row.supplierName}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      render: (row) => <span className="badge badge-secondary text-xs">{row.category}</span>,
    },
    {
      header: 'Current Stock',
      key: 'currentStock',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-sm text-main">{row.currentStock} {row.unit}</span>
          <div className="text-xs text-muted">Min buffer: {row.minStockThreshold}</div>
        </div>
      ),
    },
    {
      header: 'Prices (Cost / Sell)',
      key: 'sellingPrice',
      render: (row) => (
        <span className="text-xs">
          Rs. {Number(row.unitPrice).toLocaleString()} / <strong className="text-primary">Rs. {Number(row.sellingPrice).toLocaleString()}</strong>
        </span>
      ),
    },
    {
      header: 'Expiration',
      key: 'expiryDate',
      sortable: true,
      render: (row) => <span className="text-xs">{row.expiryDate}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setRestockItem(row);
            setRestockQty(10);
          }}
        >
          <RefreshCw size={13} /> Restock
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">PHARMACY SUPPLY CHAIN</span>
          <h2>Clinical Inventory & Stock Management</h2>
          <p className="text-sm text-muted">
            Manage surgical suture inventory, vaccines, prescription diets, lot batch codes, and low-stock reorders.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Inventory SKU
        </button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="Search inventory by name, SKU, batch, category..."
        emptyMessage="No inventory items found."
      />

      {/* Restock Modal */}
      {restockItem && (
        <Modal
          isOpen={!!restockItem}
          onClose={() => setRestockItem(null)}
          title={`Restock Product: ${restockItem.name}`}
          subtitle={`Current Level: ${restockItem.currentStock} ${restockItem.unit} (Min Threshold: ${restockItem.minStockThreshold})`}
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2" style={{ width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setRestockItem(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleRestockSubmit}>
                <Check size={16} /> Confirm Restock
              </button>
            </div>
          }
        >
          <div className="form-group">
            <label className="form-label">Units to Add to Stock</label>
            <input
              type="number"
              min="1"
              className="form-control"
              value={restockQty}
              onChange={(e) => setRestockQty(Number(e.target.value))}
            />
          </div>
        </Modal>
      )}

      {/* Add SKU Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Inventory SKU"
          size="md"
        >
          <form onSubmit={handleAddItemSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  placeholder="e.g. Amoxicillin 250mg Tablets"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={newItemData.category}
                  onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                >
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Vaccines">Vaccines</option>
                  <option value="Surgical Supplies">Surgical Supplies</option>
                  <option value="Prescription Diet">Prescription Diet</option>
                  <option value="Anesthetics">Anesthetics</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU Code <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={newItemData.sku}
                  onChange={(e) => setNewItemData({ ...newItemData, sku: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lot / Batch Code</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={newItemData.batchNumber}
                  onChange={(e) => setNewItemData({ ...newItemData, batchNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  className="form-control"
                  value={newItemData.currentStock}
                  onChange={(e) => setNewItemData({ ...newItemData, currentStock: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Buffer Threshold</label>
                <input
                  type="number"
                  className="form-control"
                  value={newItemData.minStockThreshold}
                  onChange={(e) => setNewItemData({ ...newItemData, minStockThreshold: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unit Cost (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={newItemData.unitPrice}
                  onChange={(e) => setNewItemData({ ...newItemData, unitPrice: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={newItemData.sellingPrice}
                  onChange={(e) => setNewItemData({ ...newItemData, sellingPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Product SKU
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
