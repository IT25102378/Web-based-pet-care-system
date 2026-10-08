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
  Bell,
  CheckCircle,
  Eye,
  Shield,
  Layers,
  TrendingDown,
  ArrowRight,
  Send,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';

export const InventoryPage = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter tabs
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'NEEDS_ATTENTION'
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Refill Alert State
  const [alertItem, setAlertItem] = useState(null);
  const [managerAlertNote, setManagerAlertNote] = useState('');
  const [isBulkAlertModalOpen, setIsBulkAlertModalOpen] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);

  // Edit / Add / Restock Modals
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
      showToast('Error', 'Failed to load inventory oversight data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Send Refill Alert for a Single Item to Clinic Staff
  const handleSendRefillAlert = async () => {
    if (!alertItem) return;
    setSendingAlert(true);
    try {
      const res = await inventoryApi.sendRefillAlert(alertItem.itemId, managerAlertNote);
      showToast(
        'Refill Alert Sent to Clinic Staff',
        res.message || `Notified Clinic Staff to refill ${alertItem.name}.`,
        'success'
      );
      setAlertItem(null);
      setManagerAlertNote('');
    } catch (err) {
      showToast('Error Sending Alert', err.message, 'error');
    } finally {
      setSendingAlert(false);
    }
  };

  // Send Bulk Refill Alert for All Low/Out-of-Stock Items
  const handleSendBulkRefillAlert = async () => {
    setSendingAlert(true);
    try {
      const res = await inventoryApi.sendBulkRefillAlerts();
      showToast(
        'Bulk Refill Alert Dispatched',
        res.message || 'Dispatched refill alert for low and depleted items to all Clinic Staff.',
        'success'
      );
      setIsBulkAlertModalOpen(false);
    } catch (err) {
      showToast('Error Sending Bulk Alert', err.message, 'error');
    } finally {
      setSendingAlert(false);
    }
  };

  const handleRestockSubmit = async () => {
    if (!restockItem || restockQty <= 0) return;
    try {
      await inventoryApi.updateStock(restockItem.itemId, restockQty, 'Clinic Manager Oversight Restock');
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

      showToast('Item Updated', `Changes to ${editItem.name} saved.`, 'success');
      setEditItem(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await inventoryApi.deleteInventoryItem(itemToDelete.itemId);
      showToast('Item Deleted', `${itemToDelete.name} has been removed.`, 'info');
      setItemToDelete(null);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // KPIs
  const totalItems = items.length;
  const lowStockItems = items.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold
  );
  const outOfStockItems = items.filter((i) => i.currentStock === 0);
  const inStockCount = items.filter((i) => i.currentStock > i.minStockThreshold).length;

  const totalValuation = items.reduce(
    (acc, curr) => acc + (curr.currentStock || 0) * (curr.unitPrice || 0),
    0
  );

  const needsAttentionItems = [...outOfStockItems, ...lowStockItems];

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    if (activeTab === 'NEEDS_ATTENTION') {
      const isNeeds = item.currentStock <= item.minStockThreshold;
      return matchesCategory && isNeeds;
    }
    return matchesCategory;
  });

  const columns = [
    {
      header: 'SKU & Code',
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
          <div className="text-xs text-muted">Lot: {row.batchNumber || 'N/A'}</div>
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
      header: 'Live Stock vs. Threshold',
      key: 'currentStock',
      sortable: true,
      render: (row) => {
        const isDepleted = row.currentStock === 0;
        const isLow = row.currentStock > 0 && row.currentStock <= row.minStockThreshold;
        return (
          <div style={{ minWidth: '140px' }}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span
                className="font-bold"
                style={{
                  color: isDepleted ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                }}
              >
                {row.currentStock} {row.unit}
              </span>
              <span className="text-muted">Min: {row.minStockThreshold}</span>
            </div>
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
                  backgroundColor: isDepleted ? '#EF4444' : isLow ? '#F59E0B' : '#10B981',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Pricing & Expiry',
      key: 'unitPrice',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-gray-800">
            Cost: LKR {Number(row.unitPrice || 0).toLocaleString()}
          </div>
          <div className="text-xs font-bold" style={{ color: 'var(--primary)' }}>
            Sell: LKR {Number(row.sellingPrice || 0).toLocaleString()}
          </div>
          {row.expiryDate && (
            <div className="text-xs text-muted">
              Exp: {row.expiryDate.split('T')[0]}
            </div>
          )}
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
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Manager Oversight & Actions',
      key: 'actions',
      render: (row) => {
        const needsRefill = row.currentStock <= row.minStockThreshold;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Primary Action: Send Refill Alert to Staff */}
            <button
              className="btn btn-sm"
              title="Send Refill Alert to Clinic Staff"
              onClick={() => {
                setAlertItem(row);
                setManagerAlertNote(
                  row.currentStock === 0
                    ? `Urgent: Stock is finished for ${row.name}. Please restock the item immediately.`
                    : `Stocks are nearly over for ${row.name} (${row.currentStock} ${row.unit} left). Please restock the item now.`
                );
              }}
              style={{
                backgroundColor: needsRefill ? 'var(--primary)' : '#F3F4F6',
                color: needsRefill ? '#FFFFFF' : '#374151',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: needsRefill ? '0 2px 6px rgba(231, 111, 81, 0.3)' : 'none',
              }}
            >
              <Bell size={12} className="mr-1" />
              {needsRefill
                ? row.currentStock === 0
                  ? 'Alert Staff: Stock Finished'
                  : 'Alert Staff: Stock Nearly Over'
                : 'Send Alert'}
            </button>

            {/* Quick Restock if Manager wishes to adjust */}
            <button
              className="btn btn-ghost btn-sm"
              title="Restock Product Directly"
              onClick={() => {
                setRestockItem(row);
                setRestockQty(10);
              }}
              style={{ padding: '0.35rem 0.45rem' }}
            >
              <RefreshCw size={13} color="#10B981" />
            </button>

            {/* Edit */}
            <button
              className="btn btn-ghost btn-sm"
              title="Edit Product Details"
              onClick={() => setEditItem({ ...row })}
              style={{ padding: '0.35rem 0.45rem' }}
            >
              <Edit2 size={13} color="#4B5563" />
            </button>

            {/* Delete */}
            <button
              className="btn btn-ghost btn-sm"
              title="Delete Product"
              onClick={() => setItemToDelete(row)}
              style={{ padding: '0.35rem 0.45rem', color: '#EF4444' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Executive Oversight Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge mb-1"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 700 }}
            >
              EXECUTIVE INVENTORY OVERSIGHT
            </span>
            <span
              className="badge text-xs flex items-center gap-1"
              style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 600 }}
            >
              <Eye size={12} /> Stock Monitoring & Staff Alerts
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Inventory Oversight & Stock Alerts
          </h2>
          <p className="text-sm text-muted">
            Monitor clinical pharmacy levels, detect finished or depleted products, and send instant
            refill alerts to Clinic Staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {needsAttentionItems.length > 0 && (
            <button
              onClick={() => setIsBulkAlertModalOpen(true)}
              className="btn"
              style={{
                backgroundcolor: 'var(--primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
              }}
            >
              <Bell size={16} /> Alert Staff on All Low Items ({needsAttentionItems.length})
            </button>
          )}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-secondary"
          >
            <Plus size={15} /> Add SKU
          </button>
          <button
            onClick={loadData}
            className="btn btn-secondary"
            title="Refresh inventory list"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Oversight Summary Metrics */}
      <div className="grid-4 mb-6">
        <StatCard
          label="Total Catalog SKUs"
          value={totalItems}
          icon={Package}
          iconBg="var(--primary-subtle)"
          iconColor="var(--primary)"
          trend="Tracked products"
        />
        <StatCard
          label="Healthy Buffer Stock"
          value={inStockCount}
          icon={CheckCircle}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10B981"
          trend="Adequate quantity"
        />
        <StatCard
          label="Low Stock (Alert Needed)"
          value={lowStockItems.length}
          icon={AlertTriangle}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="Under min limit"
        />
        <StatCard
          label="Finished / Depleted"
          value={outOfStockItems.length}
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="#EF4444"
          trend="Urgent refill"
        />
      </div>

      {/* Critical Refill Oversight Alert Banner */}
      {needsAttentionItems.length > 0 && (
        <div
          className="card p-4 mb-6"
          style={{
            backgroundColor: '#FFF7ED',
            border: '1px solid #FFEDD5',
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
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#FFEDD5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
              }}
            >
              <Bell size={20} />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: '#9A3412' }}>
                Stock Shortage Detected: {outOfStockItems.length > 0 ? `${outOfStockItems.length} Finished, ` : ''}{lowStockItems.length}{' '}
                Stocks Nearly Over
              </div>
              <p className="text-xs" style={{ color: '#C2410C', margin: 0 }}>
                Stocks are nearly over or finished for these items. Alert clinic staff so they can restock the items immediately.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsBulkAlertModalOpen(true)}
            className="btn btn-sm"
            style={{
              backgroundColor: '#EA580C',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.8rem',
            }}
          >
            <Send size={13} className="mr-1" /> Send Refill Alert to Staff
          </button>
        </div>
      )}

      {/* View Tabs & Filters */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('ALL')}
            style={
              activeTab === 'ALL'
                ? { backgroundcolor: 'var(--text-main)', color: '#FFFFFF', fontWeight: 700 }
                : {}
            }
          >
            All Products ({totalItems})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'NEEDS_ATTENTION' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('NEEDS_ATTENTION')}
            style={
              activeTab === 'NEEDS_ATTENTION'
                ? { backgroundcolor: 'var(--primary)', color: '#FFFFFF', fontWeight: 700 }
                : { color: needsAttentionItems.length > 0 ? 'var(--primary)' : '#6B7280' }
            }
          >
            <AlertTriangle size={13} className="mr-1" />
            Needs Attention ({needsAttentionItems.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Filter items by SKU, name, supplier..."
        emptyMessage="No inventory items match the selected oversight filter."
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. Send Single Refill Alert Modal                             */}
      {/* ------------------------------------------------------------- */}
      {alertItem && (
        <Modal
          isOpen={true}
          onClose={() => setAlertItem(null)}
          title="Send Refill Alert to Clinic Staff"
          subtitle={`Item: ${alertItem.name} (SKU: ${alertItem.sku})`}
          size="md"
        >
          <div className="flex flex-col gap-4">
            {/* Status Summary */}
            <div
              className="p-3"
              style={{
                backgroundColor: alertItem.currentStock === 0 ? '#FEF2F2' : '#FFFBEB',
                border: `1px solid ${alertItem.currentStock === 0 ? '#FECACA' : '#FDE68A'}`,
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700">Current Stock:</span>
                <span
                  className="font-bold text-sm"
                  style={{ color: alertItem.currentStock === 0 ? '#DC2626' : '#D97706' }}
                >
                  {alertItem.currentStock === 0
                    ? '0 - COMPLETED / FINISHED'
                    : `${alertItem.currentStock} ${alertItem.unit} (Threshold: ${alertItem.minStockThreshold})`}
                </span>
              </div>
              <div className="text-xs text-muted">
                Clinic Staff members will receive an in-app notification linking directly to their
                Inventory Management view to restock this product.
              </div>
            </div>

            {/* Note to Staff */}
            <div>
              <label className="form-label font-bold text-xs">
                Custom Message / Instructions for Clinic Staff:
              </label>
              <textarea
                className="form-input"
                rows="3"
                value={managerAlertNote}
                onChange={(e) => setManagerAlertNote(e.target.value)}
                placeholder="e.g. Stocks are nearly over, so please restock this item before tomorrow morning appointments."
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={sendingAlert}
                onClick={() => setAlertItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={sendingAlert}
                style={{
                  backgroundcolor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onClick={handleSendRefillAlert}
              >
                <Send size={14} />
                {sendingAlert ? 'Sending Alert...' : 'Dispatch Refill Alert'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. Bulk Refill Alert Modal                                    */}
      {/* ------------------------------------------------------------- */}
      {isBulkAlertModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBulkAlertModalOpen(false)}
          title="Send Bulk Refill Alert to Clinic Staff"
          subtitle={`Alert staff regarding all ${needsAttentionItems.length} low or finished products`}
          size="md"
        >
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-600">
              The following products have reached or breached their minimum stock limits. Dispatching
              this alert will notify all active Clinic Staff members to check and restock inventory.
            </p>

            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #E5E7EB',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem',
              }}
            >
              {needsAttentionItems.map((it) => (
                <div
                  key={it.itemId}
                  className="flex justify-between items-center py-1.5 border-b text-xs last:border-b-0"
                >
                  <div>
                    <span className="font-bold text-gray-800">{it.name}</span>
                    <span className="text-muted ml-2 font-mono">({it.sku})</span>
                  </div>
                  <span
                    className="font-semibold"
                    style={{ color: it.currentStock === 0 ? '#DC2626' : '#D97706' }}
                  >
                    {it.currentStock} / {it.minStockThreshold} {it.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={sendingAlert}
                onClick={() => setIsBulkAlertModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={sendingAlert}
                style={{
                  backgroundcolor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
                onClick={handleSendBulkRefillAlert}
              >
                <Send size={14} />
                {sendingAlert ? 'Dispatching...' : `Alert Staff for ${needsAttentionItems.length} Items`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. Direct Restock Modal (Optional for Manager)                */}
      {/* ------------------------------------------------------------- */}
      {restockItem && (
        <Modal
          isOpen={true}
          onClose={() => setRestockItem(null)}
          title={`Direct Restock: ${restockItem.name}`}
          subtitle={`Current stock: ${restockItem.currentStock} ${restockItem.unit}`}
          size="sm"
        >
          <div className="flex flex-col gap-4">
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
                New stock will be{' '}
                <strong>
                  {restockItem.currentStock + Number(restockQty)} {restockItem.unit}
                </strong>
              </span>
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
                Confirm Restock (+{restockQty})
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Add SKU Modal                                              */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Inventory Item"
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
                value={newItemData.sku}
                onChange={(e) => setNewItemData({ ...newItemData, sku: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Category</label>
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
              <label className="form-label font-bold text-xs">Unit</label>
              <input
                type="text"
                required
                className="form-input"
                value={newItemData.unit}
                onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Initial Stock</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={newItemData.currentStock}
                onChange={(e) => setNewItemData({ ...newItemData, currentStock: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Min Threshold</label>
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
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Batch / Lot Number</label>
              <input
                type="text"
                placeholder="e.g. LOT-2026-09"
                className="form-input"
                value={newItemData.batchNumber || ''}
                onChange={(e) => setNewItemData({ ...newItemData, batchNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={newItemData.expiryDate || ''}
                onChange={(e) => setNewItemData({ ...newItemData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2 gap-4">
            <div>
              <label className="form-label font-bold text-xs">Cost Price (LKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="form-input"
                value={newItemData.unitPrice}
                onChange={(e) => setNewItemData({ ...newItemData, unitPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label font-bold text-xs">Selling Price (LKR) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                className="form-input"
                value={newItemData.sellingPrice}
                onChange={(e) => setNewItemData({ ...newItemData, sellingPrice: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label font-bold text-xs">Supplier</label>
            <select
              className="form-select"
              value={newItemData.supplierId || ''}
              onChange={(e) => {
                const suppId = e.target.value;
                const supp = suppliers.find((s) => s.supplierId === suppId);
                setNewItemData({
                  ...newItemData,
                  supplierId: suppId,
                  supplierName: supp ? supp.companyName : '',
                });
              }}
            >
              <option value="">-- Direct / In-House Vendor --</option>
              {suppliers.map((s) => (
                <option key={s.supplierId || s.id} value={s.supplierId}>
                  {s.companyName} ({s.supplierId})
                </option>
              ))}
            </select>
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
              Add Item
            </button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 5. Edit Modal                                                 */}
      {/* ------------------------------------------------------------- */}
      {editItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditItem(null)}
          title={`Edit: ${editItem.name}`}
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
                <label className="form-label font-bold text-xs">SKU *</label>
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
            </div>

            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Batch / Lot Number</label>
                <input
                  type="text"
                  placeholder="e.g. LOT-2026-09"
                  className="form-input"
                  value={editItem.batchNumber || ''}
                  onChange={(e) => setEditItem({ ...editItem, batchNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Expiry Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editItem.expiryDate ? editItem.expiryDate.split('T')[0] : ''}
                  onChange={(e) => setEditItem({ ...editItem, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2 gap-4">
              <div>
                <label className="form-label font-bold text-xs">Cost Price (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  value={editItem.unitPrice ?? ''}
                  onChange={(e) => setEditItem({ ...editItem, unitPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label font-bold text-xs">Selling Price (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="form-input"
                  value={editItem.sellingPrice ?? ''}
                  onChange={(e) => setEditItem({ ...editItem, sellingPrice: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label font-bold text-xs">Supplier</label>
              <select
                className="form-select"
                value={editItem.supplierId || ''}
                onChange={(e) => {
                  const suppId = e.target.value;
                  const supp = suppliers.find((s) => s.supplierId === suppId);
                  setEditItem({
                    ...editItem,
                    supplierId: suppId,
                    supplierName: supp ? supp.companyName : editItem.supplierName,
                  });
                }}
              >
                <option value="">-- Direct / In-House Vendor --</option>
                {suppliers.map((s) => (
                  <option key={s.supplierId || s.id} value={s.supplierId}>
                    {s.companyName} ({s.supplierId})
                  </option>
                ))}
              </select>
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
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. Delete Modal                                               */}
      {/* ------------------------------------------------------------- */}
      {itemToDelete && (
        <Modal
          isOpen={true}
          onClose={() => setItemToDelete(null)}
          title="Confirm Delete"
          size="sm"
        >
          <p className="text-sm text-gray-700">
            Are you sure you want to remove <strong>{itemToDelete.name}</strong> from the catalog?
          </p>
          <div className="flex justify-end gap-3 mt-4">
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
              onClick={handleDeleteItem}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default InventoryPage;
