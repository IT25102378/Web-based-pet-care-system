import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { supplierApi } from '../../api/supplierApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Package, Plus, RefreshCw, AlertTriangle, Check, ArrowRight, Edit2, Trash2 } from 'lucide-react';

export const InventoryPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'Pharmaceuticals',
    sku: '',
    batchNumber: '',
    currentStock: 25,
    minStockThreshold: 10,
    unit: 'Bottles',
    unitPrice: 2500.00,
    sellingPrice: 4000.00,
    expiryDate: '',
    supplierId: '',
    supplierName: '',
  });

  const loadData = async () => {
    try {
      const [invList, suppList] = await Promise.allSettled([
        inventoryApi.getInventory(),
        supplierApi.getSuppliers(),
      ]);
      if (invList.status === 'fulfilled' && invList.value) setItems(invList.value);
      if (suppList.status === 'fulfilled' && suppList.value) setSuppliers(suppList.value);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRestockSubmit = async () => {
    if (!restockItem || restockQty <= 0) return;
    try {
      await inventoryApi.updateStock(restockItem.itemId, restockQty, 'Manager Direct Restock');
      showToast('Stock Replenished', `Added ${restockQty} units to ${restockItem.name}`, 'success');
      setRestockItem(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemData.name || !newItemData.sku || !newItemData.unit) {
      showToast('Validation Error', 'Item name, SKU, and unit are required.', 'error');
      return;
    }

    try {
      let suppName = newItemData.supplierName;
      if (newItemData.supplierId) {
        const found = suppliers.find((s) => s.supplierId === newItemData.supplierId);
        if (found) suppName = found.companyName;
      }

      await inventoryApi.addInventoryItem({
        ...newItemData,
        supplierName: suppName || 'Direct Vendor',
        currentStock: Number(newItemData.currentStock) || 0,
        minStockThreshold: Number(newItemData.minStockThreshold) || 5,
        unitPrice: Number(newItemData.unitPrice) || 0,
        sellingPrice: Number(newItemData.sellingPrice) || 0,
        expiryDate: newItemData.expiryDate || null,
      });

      showToast('Item Created', `${newItemData.name} added to pharmacy inventory.`, 'success');
      setIsAddModalOpen(false);
      setNewItemData({
        name: '',
        category: 'Pharmaceuticals',
        sku: '',
        batchNumber: '',
        currentStock: 25,
        minStockThreshold: 10,
        unit: 'Bottles',
        unitPrice: 2500.00,
        sellingPrice: 4000.00,
        expiryDate: '',
        supplierId: '',
        supplierName: '',
      });
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleEditItemSubmit = async (e) => {
    e.preventDefault();
    if (!editItem.name || !editItem.sku || !editItem.unit) {
      showToast('Validation Error', 'Item name, SKU, and unit are required.', 'error');
      return;
    }

    try {
      let suppName = editItem.supplierName;
      if (editItem.supplierId) {
        const found = suppliers.find((s) => s.supplierId === editItem.supplierId);
        if (found) suppName = found.companyName;
      }

      await inventoryApi.updateInventoryItem(editItem.itemId, {
        name: editItem.name,
        category: editItem.category,
        sku: editItem.sku,
        batchNumber: editItem.batchNumber,
        currentStock: Number(editItem.currentStock) || 0,
        minStockThreshold: Number(editItem.minStockThreshold) || 5,
        unit: editItem.unit,
        unitPrice: Number(editItem.unitPrice) || 0,
        sellingPrice: Number(editItem.sellingPrice) || 0,
        expiryDate: editItem.expiryDate || null,
        supplierId: editItem.supplierId || null,
        supplierName: suppName,
      });

      showToast('Item Updated', `${editItem.name} details successfully updated.`, 'success');
      setEditItem(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteItemSubmit = async () => {
    if (!itemToDelete) return;
    try {
      await inventoryApi.deleteInventoryItem(itemToDelete.itemId);
      showToast('Item Deleted', `${itemToDelete.name} has been removed from inventory.`, 'info');
      setItemToDelete(null);
      loadData();
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
          <div className="text-xs text-muted">
            {row.batchNumber ? `Batch: ${row.batchNumber} • ` : ''}Supplier: {row.supplierName || 'Direct'}
          </div>
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
      render: (row) => <span className="text-xs font-mono">{row.expiryDate || 'N/A'}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setRestockItem(row);
              setRestockQty(10);
            }}
            title="Restock Product Units"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <RefreshCw size={13} /> Restock
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setEditItem({ ...row })}
            title="Edit Item Details"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => setItemToDelete(row)}
            title="Delete Item"
            style={{ padding: '0.3rem 0.5rem', color: '#EF4444' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
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
        searchPlaceholder="Search inventory by name, SKU, batch, category, supplier..."
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
                  <option value="Diagnostics & Lab Reagents">Diagnostics & Lab Reagents</option>
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
                  placeholder="e.g. MED-AMOX-01"
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
                  placeholder="e.g. BT-2026-08"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Packaging Unit <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={newItemData.unit}
                  onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
                >
                  <option value="Bottles">Bottles</option>
                  <option value="Vials">Vials</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Packs">Packs</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Tubes">Tubes</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier / Distributor</label>
                <select
                  className="form-select"
                  value={newItemData.supplierId}
                  onChange={(e) => {
                    const sel = suppliers.find((s) => s.supplierId === e.target.value);
                    setNewItemData({
                      ...newItemData,
                      supplierId: e.target.value,
                      supplierName: sel ? sel.companyName : newItemData.supplierName,
                    });
                  }}
                >
                  <option value="">-- Direct / Unassigned Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.companyName} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={newItemData.currentStock}
                  onChange={(e) => setNewItemData({ ...newItemData, currentStock: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Buffer Threshold</label>
                <input
                  type="number"
                  min="0"
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
                  min="0"
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
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={newItemData.sellingPrice}
                  onChange={(e) => setNewItemData({ ...newItemData, sellingPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expiration Date</label>
              <input
                type="date"
                className="form-control"
                value={newItemData.expiryDate}
                onChange={(e) => setNewItemData({ ...newItemData, expiryDate: e.target.value })}
              />
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

      {/* Edit SKU Modal */}
      {editItem && (
        <Modal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          title={`Edit Product SKU: ${editItem.sku}`}
          subtitle={`Editing details for ${editItem.name}`}
          size="md"
        >
          <form onSubmit={handleEditItemSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={editItem.name || ''}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={editItem.category || 'Pharmaceuticals'}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                >
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Vaccines">Vaccines</option>
                  <option value="Surgical Supplies">Surgical Supplies</option>
                  <option value="Prescription Diet">Prescription Diet</option>
                  <option value="Anesthetics">Anesthetics</option>
                  <option value="Diagnostics & Lab Reagents">Diagnostics & Lab Reagents</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SKU Code <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={editItem.sku || ''}
                  onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lot / Batch Code</label>
                <input
                  type="text"
                  className="form-control font-mono"
                  value={editItem.batchNumber || ''}
                  onChange={(e) => setEditItem({ ...editItem, batchNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Packaging Unit</label>
                <select
                  className="form-select"
                  value={editItem.unit || 'Bottles'}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                >
                  <option value="Bottles">Bottles</option>
                  <option value="Vials">Vials</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Packs">Packs</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Tubes">Tubes</option>
                  <option value="Bags">Bags</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Supplier / Distributor</label>
                <select
                  className="form-select"
                  value={editItem.supplierId || ''}
                  onChange={(e) => {
                    const sel = suppliers.find((s) => s.supplierId === e.target.value);
                    setEditItem({
                      ...editItem,
                      supplierId: e.target.value,
                      supplierName: sel ? sel.companyName : editItem.supplierName,
                    });
                  }}
                >
                  <option value="">-- Direct / Unassigned Supplier --</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.companyName} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={editItem.currentStock ?? 0}
                  onChange={(e) => setEditItem({ ...editItem, currentStock: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Min Buffer Threshold</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={editItem.minStockThreshold ?? 5}
                  onChange={(e) => setEditItem({ ...editItem, minStockThreshold: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Unit Cost (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={editItem.unitPrice ?? 0}
                  onChange={(e) => setEditItem({ ...editItem, unitPrice: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selling Price (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={editItem.sellingPrice ?? 0}
                  onChange={(e) => setEditItem({ ...editItem, sellingPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expiration Date</label>
              <input
                type="date"
                className="form-control"
                value={editItem.expiryDate || ''}
                onChange={(e) => setEditItem({ ...editItem, expiryDate: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Update Product SKU
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Item Modal */}
      {itemToDelete && (
        <Modal
          isOpen={!!itemToDelete}
          onClose={() => setItemToDelete(null)}
          title="Delete Inventory SKU"
          subtitle={`Are you sure you want to remove "${itemToDelete.name}" (${itemToDelete.sku})?`}
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2" style={{ width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setItemToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                onClick={handleDeleteItemSubmit}
              >
                <Trash2 size={16} /> Confirm Delete
              </button>
            </div>
          }
        >
          <p className="text-sm text-muted">
            This action will permanently delete this product from the clinical inventory catalog. Any historical records referencing this SKU will retain its historical name.
          </p>
        </Modal>
      )}
    </div>
  );
};
