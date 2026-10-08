import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { supplierApi } from '../../api/supplierApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Package,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  Check,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';

export const StaffInventoryPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState(10);
  const [restockReason, setRestockReason] = useState('Routine Clinic Staff Restock');

  const [newItemData, setNewItemData] = useState({
    name: '',
    category: 'Pharmaceuticals',
    sku: '',
    batchNumber: '',
    currentStock: 25,
    minStockThreshold: 10,
    unit: 'Bottles',
    unitPrice: 2500.0,
    sellingPrice: 4000.0,
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
      showToast('Error', 'Failed to load inventory data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        supplierName: suppName || 'Direct Clinic Vendor',
        currentStock: Number(newItemData.currentStock) || 0,
        minStockThreshold: Number(newItemData.minStockThreshold) || 5,
        unitPrice: Number(newItemData.unitPrice) || 0,
        sellingPrice: Number(newItemData.sellingPrice) || 0,
        expiryDate: newItemData.expiryDate || null,
      });

      showToast('Item Created', `${newItemData.name} successfully added to inventory.`, 'success');
      setIsAddModalOpen(false);
      setNewItemData({
        name: '',
        category: 'Pharmaceuticals',
        sku: '',
        batchNumber: '',
        currentStock: 25,
        minStockThreshold: 10,
        unit: 'Bottles',
        unitPrice: 2500.0,
        sellingPrice: 4000.0,
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
        currentStock: Number(editItem.currentStock),
        minStockThreshold: Number(editItem.minStockThreshold),
        unit: editItem.unit,
        unitPrice: Number(editItem.unitPrice),
        sellingPrice: Number(editItem.sellingPrice),
        expiryDate: editItem.expiryDate || null,
        supplierId: editItem.supplierId || null,
        supplierName: suppName,
      });

      showToast('Item Updated', `Changes to ${editItem.name} saved successfully.`, 'success');
      setEditItem(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRestockSubmit = async () => {
    if (!restockItem || restockQty <= 0) return;
    try {
      await inventoryApi.updateStock(
        restockItem.itemId,
        Number(restockQty),
        restockReason || 'Clinic Staff Restocking'
      );
      showToast(
        'Stock Replenished',
        `Added ${restockQty} ${restockItem.unit || 'units'} to ${restockItem.name}.`,
        'success'
      );
      setRestockItem(null);
      setRestockQty(10);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!itemToDelete) return;
    try {
      await inventoryApi.deleteInventoryItem(itemToDelete.itemId);
      showToast('Item Removed', `${itemToDelete.name} has been deleted from inventory.`, 'info');
      setItemToDelete(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const totalItems = items.length;
  const lowStockCount = items.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold
  ).length;
  const outOfStockCount = items.filter((i) => i.currentStock === 0).length;
  const inStockCount = items.filter((i) => i.currentStock > i.minStockThreshold).length;

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      item.status === statusFilter ||
      (statusFilter === 'InStock' && item.status === 'In Stock') ||
      (statusFilter === 'LowStock' && item.status === 'Low Stock') ||
      (statusFilter === 'OutOfStock' && item.status === 'Out of Stock');
    return matchesCategory && matchesStatus;
  });

  const columns = [
    {
      header: 'Item SKU',
      key: 'sku',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-bold" style={{ color: 'var(--primary)' }}>
          {row.sku}
        </span>
      ),
    },
    {
      header: 'Product Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>
            {row.name}
          </div>
          <div className="text-xs text-muted">Batch: {row.batchNumber || 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      render: (row) => (
        <span
          className="badge"
          style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 600 }}
        >
          {row.category}
        </span>
      ),
    },
    {
      header: 'Stock Level',
      key: 'currentStock',
      sortable: true,
      render: (row) => {
        const isCritical = row.currentStock === 0;
        const isLow = row.currentStock > 0 && row.currentStock <= row.minStockThreshold;
        return (
          <div style={{ minWidth: '130px' }}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className="font-bold"
                style={{
                  color: isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                }}
              >
                {row.currentStock} {row.unit}
              </span>
              <span className="text-muted">Min: {row.minStockThreshold}</span>
            </div>
            {/* Stock meter */}
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#E5E7EB',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((row.currentStock / (row.minStockThreshold * 2 || 1)) * 100)
                  )}%`,
                  height: '100%',
                  backgroundColor: isCritical ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Unit Price',
      key: 'unitPrice',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-gray-800">
            LKR {Number(row.unitPrice || 0).toLocaleString()}
          </span>
          <div className="text-xs text-muted">
            Sell: LKR {Number(row.sellingPrice || 0).toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      header: 'Supplier',
      key: 'supplierName',
      render: (row) => (
        <span className="text-xs font-medium text-gray-700">{row.supplierName || 'Direct'}</span>
      ),
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-mono text-gray-600">{row.expiryDate || 'N/A'}</span>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => {
        const isDepleted = row.currentStock === 0;
        const isLow = row.currentStock > 0 && row.currentStock <= row.minStockThreshold;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              className="btn btn-sm"
              title={
                isDepleted
                  ? 'Stock is finished (0 remaining) - Restock item now'
                  : isLow
                  ? 'Stocks are nearly over - Restock item now'
                  : 'Restock Product'
              }
              onClick={() => {
                setRestockItem(row);
                setRestockQty(10);
                setRestockReason(
                  isDepleted
                    ? 'Stock Was Finished – Urgent Restock'
                    : isLow
                    ? 'Stocks Nearly Over – Proactive Restock'
                    : 'Routine Clinic Staff Restock'
                );
              }}
              style={{
                backgroundColor: isDepleted ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                color: '#FFFFFF',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: isDepleted || isLow ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              <RefreshCw size={12} className="mr-1" />
              {isDepleted
                ? 'Stock Finished – Restock'
                : isLow
                ? 'Stock Nearly Over – Restock'
                : 'Restock'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              title="Edit Item Details"
              onClick={() => setEditItem({ ...row })}
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <Edit2 size={14} color="#4B5563" />
            </button>
            <button
              className="btn btn-ghost btn-sm"
              title="Delete Item"
              onClick={() => setItemToDelete(row)}
              style={{ padding: '0.35rem 0.5rem', color: '#EF4444' }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge mb-1"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 700 }}
            >
              STAFF INVENTORY OPERATIONS
            </span>
            <span
              className="badge text-xs flex items-center gap-1"
              style={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 600 }}
            >
              <ShieldCheck size={12} /> Full Management & Restock Access
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Clinical Inventory Management
          </h2>
          <p className="text-sm text-muted">
            Add new products, adjust live stock, update SKU details, and replenish items flagged by
            the Clinic Manager.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn"
            style={{
              backgroundcolor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
            }}
          >
            <Plus size={16} /> Add New Product
          </button>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            title="Refresh inventory list"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid-4 mb-6">
        <StatCard
          label="Total Catalog Items"
          value={totalItems}
          icon={Package}
          iconBg="var(--primary-subtle)"
          iconColor="var(--primary)"
          trend="Active SKUs"
        />
        <StatCard
          label="In Stock & Healthy"
          value={inStockCount}
          icon={CheckCircle}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10B981"
          trend="Sufficient buffer"
        />
        <StatCard
          label="Low Stock Alert"
          value={lowStockCount}
          icon={AlertTriangle}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="Needs Refill"
        />
        <StatCard
          label="Out of Stock"
          value={outOfStockCount}
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#EF4444"
          trend="Urgent action"
        />
      </div>

      {/* Urgent Refill Notice Banner */}
      {lowStockCount + outOfStockCount > 0 && (
        <div
          className="card p-4 mb-6"
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: '#92400E' }}>
                Stocks Are Nearly Over / Finished: {lowStockCount + outOfStockCount} Item(s) Require Restocking
              </div>
              <p className="text-xs" style={{ color: '#B45309', margin: 0 }}>
                {outOfStockCount > 0 && `${outOfStockCount} product(s) are completely finished (0 remaining). `}
                {lowStockCount > 0 && `${lowStockCount} product(s) have stocks nearly over. `}
                Stocks are nearly over, so restock the items to keep clinic operations running smoothly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('LowStock')}
            className="btn btn-sm"
            style={{
              backgroundColor: '#D97706',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          >
            Filter Low Stock Items
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-xs font-semibold text-muted">Category:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="Pharmaceuticals">Pharmaceuticals</option>
            <option value="Vaccines">Vaccines</option>
            <option value="Surgical Supplies">Surgical Supplies</option>
            <option value="Prescription Diet">Prescription Diet</option>
            <option value="Anesthetics">Anesthetics</option>
          </select>

          <label className="text-xs font-semibold text-muted ml-3">Stock Status:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="InStock">In Stock</option>
            <option value="LowStock">Low Stock</option>
            <option value="OutOfStock">Out of Stock</option>
          </select>
        </div>

        {statusFilter !== 'ALL' || categoryFilter !== 'ALL' ? (
          <button
            className="btn btn-ghost btn-sm text-xs"
            onClick={() => {
              setStatusFilter('ALL');
              setCategoryFilter('ALL');
            }}
          >
            Reset Filters
          </button>
        ) : null}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Search inventory by item name, SKU, batch number..."
        emptyMessage="No inventory items match your search criteria."
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. Add Product Modal                                          */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Inventory Product"
        subtitle="Create a new pharmaceutical SKU or clinical supply entry"
        size="lg"
      >
        <form onSubmit={handleAddItemSubmit} className="flex flex-col gap-4">
          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Product Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Amoxicillin 250mg Clavulanate"
                value={newItemData.name}
                onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">SKU Code *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. MED-AMX-250"
                value={newItemData.sku}
                onChange={(e) => setNewItemData({ ...newItemData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Category *</label>
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
            <div>
              <label className="form-label font-bold text-xs">Batch / Lot Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BT-99201"
                value={newItemData.batchNumber}
                onChange={(e) => setNewItemData({ ...newItemData, batchNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-3 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Initial Stock Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={newItemData.currentStock}
                onChange={(e) => setNewItemData({ ...newItemData, currentStock: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Min Stock Threshold</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={newItemData.minStockThreshold}
                onChange={(e) =>
                  setNewItemData({ ...newItemData, minStockThreshold: e.target.value })
                }
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Unit Type *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Bottles, Vials, Boxes"
                value={newItemData.unit}
                onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Unit Cost (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={newItemData.unitPrice}
                onChange={(e) => setNewItemData({ ...newItemData, unitPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Selling Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={newItemData.sellingPrice}
                onChange={(e) =>
                  setNewItemData({ ...newItemData, sellingPrice: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={newItemData.expiryDate}
                onChange={(e) => setNewItemData({ ...newItemData, expiryDate: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Supplier</label>
              <select
                className="form-select"
                value={newItemData.supplierId}
                onChange={(e) =>
                  setNewItemData({ ...newItemData, supplierId: e.target.value })
                }
              >
                <option value="">Select Supplier (Optional)</option>
                {suppliers.map((s) => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.companyName} ({s.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{ backgroundcolor: 'var(--primary)', color: '#FFFFFF', fontWeight: 700 }}
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 2. Edit Product Modal                                         */}
      {/* ------------------------------------------------------------- */}
      {editItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditItem(null)}
          title={`Edit Product: ${editItem.name}`}
          subtitle="Update product parameters, pricing, and reorder levels"
          size="lg"
        >
          <form onSubmit={handleEditItemSubmit} className="flex flex-col gap-4">
            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Product Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editItem.name}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">SKU Code *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editItem.sku}
                  onChange={(e) => setEditItem({ ...editItem, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Category</label>
                <select
                  className="form-select"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                >
                  <option value="Pharmaceuticals">Pharmaceuticals</option>
                  <option value="Vaccines">Vaccines</option>
                  <option value="Surgical Supplies">Surgical Supplies</option>
                  <option value="Prescription Diet">Prescription Diet</option>
                  <option value="Anesthetics">Anesthetics</option>
                </select>
              </div>
              <div>
                <label className="form-label font-bold text-xs">Batch Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={editItem.batchNumber || ''}
                  onChange={(e) => setEditItem({ ...editItem, batchNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Current Stock</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={editItem.currentStock}
                  onChange={(e) => setEditItem({ ...editItem, currentStock: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Min Threshold</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={editItem.minStockThreshold}
                  onChange={(e) =>
                    setEditItem({ ...editItem, minStockThreshold: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Unit</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={editItem.unit}
                  onChange={(e) => setEditItem({ ...editItem, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Unit Cost (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={editItem.unitPrice || ''}
                  onChange={(e) => setEditItem({ ...editItem, unitPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Selling Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  value={editItem.sellingPrice || ''}
                  onChange={(e) => setEditItem({ ...editItem, sellingPrice: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editItem.expiryDate || ''}
                  onChange={(e) => setEditItem({ ...editItem, expiryDate: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Supplier</label>
                <select
                  className="form-select"
                  value={editItem.supplierId || ''}
                  onChange={(e) => setEditItem({ ...editItem, supplierId: e.target.value })}
                >
                  <option value="">Select Supplier (Optional)</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.companyName} ({s.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditItem(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn"
                style={{ backgroundcolor: 'var(--text-main)', color: '#FFFFFF', fontWeight: 700 }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Quick Restock Modal                                        */}
      {/* ------------------------------------------------------------- */}
      {restockItem && (
        <Modal
          isOpen={true}
          onClose={() => setRestockItem(null)}
          title={
            restockItem.currentStock === 0
              ? `Stock Finished – Restock ${restockItem.name}`
              : restockItem.currentStock <= restockItem.minStockThreshold
              ? `Stocks Nearly Over – Restock ${restockItem.name}`
              : `Restock Item: ${restockItem.name}`
          }
          subtitle={
            restockItem.currentStock === 0
              ? 'Stock is completely finished (0 remaining). Restock the items now.'
              : restockItem.currentStock <= restockItem.minStockThreshold
              ? `Stocks are nearly over (${restockItem.currentStock} ${restockItem.unit} remaining against threshold of ${restockItem.minStockThreshold}). Restock the items now.`
              : `Current stock: ${restockItem.currentStock} ${restockItem.unit} (Min Threshold: ${restockItem.minStockThreshold})`
          }
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <div
              className="p-3"
              style={{
                backgroundColor:
                  restockItem.currentStock === 0
                    ? '#FEF2F2'
                    : restockItem.currentStock <= restockItem.minStockThreshold
                    ? '#FFFBEB'
                    : '#F3F4F6',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
              }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-muted">SKU:</span>
                <span className="font-mono font-bold">{restockItem.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Current Stock Status:</span>
                <span
                  className="font-bold"
                  style={{
                    color:
                      restockItem.currentStock === 0
                        ? '#EF4444'
                        : restockItem.currentStock <= restockItem.minStockThreshold
                        ? '#F59E0B'
                        : '#10B981',
                  }}
                >
                  {restockItem.currentStock === 0
                    ? '0 (Finished)'
                    : restockItem.currentStock <= restockItem.minStockThreshold
                    ? `${restockItem.currentStock} ${restockItem.unit} (Nearly Over)`
                    : `${restockItem.currentStock} ${restockItem.unit} (Healthy)`}
                </span>
              </div>
            </div>

            <div>
              <label className="form-label font-bold text-xs">Quantity to Add *</label>
              <input
                type="number"
                min="1"
                required
                className="form-input text-lg font-bold"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <span className="text-xs text-muted mt-1">
                Updated stock will be{' '}
                <strong>
                  {restockItem.currentStock + Number(restockQty)} {restockItem.unit}
                </strong>
              </span>
            </div>

            <div>
              <label className="form-label font-bold text-xs">Restock Reason</label>
              <select
                className="form-select mb-2"
                value={restockReason}
                onChange={(e) => setRestockReason(e.target.value)}
              >
                <option value="Stocks Nearly Over – Restock">Stocks Nearly Over – Restock</option>
                <option value="Stock Finished – Restock">Stock Finished – Restock</option>
                <option value="Restocked per Clinic Manager Alert">
                  Restocked per Clinic Manager Alert
                </option>
                <option value="Direct Supplier Delivery Received">
                  Direct Supplier Delivery Received
                </option>
                <option value="Routine Clinic Staff Restock">Routine Clinic Staff Restock</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRestockItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700 }}
                onClick={handleRestockSubmit}
              >
                Restock Item (+{restockQty})
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Delete Confirmation Modal                                  */}
      {/* ------------------------------------------------------------- */}
      {itemToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setItemToDelete(null)}
          title="Confirm Delete"
          subtitle="Are you sure you want to remove this item from the catalog?"
          size="sm"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-700">
              You are about to delete <strong>{itemToDelete.name}</strong> (SKU: {itemToDelete.sku}).
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteSubmit}
              >
                Delete Product
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default StaffInventoryPage;
