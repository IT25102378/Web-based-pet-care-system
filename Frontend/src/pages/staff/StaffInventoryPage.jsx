import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StatCard } from '../../components/common/StatCard';
import { Package, AlertTriangle, CheckCircle, Shield, Search, Filter } from 'lucide-react';

export const StaffInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
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
    loadInventory();
  }, []);

  const totalItems = items.length;
  const lowStockCount = items.filter((i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold).length;
  const outOfStockCount = items.filter((i) => i.currentStock === 0).length;
  const inStockCount = items.filter((i) => i.currentStock > i.minStockThreshold).length;

  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  const columns = [
    {
      header: 'Item SKU',
      key: 'sku',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold" style={{ color: '#E76F51' }}>{row.sku}</span>,
    },
    {
      header: 'Product Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm" style={{ color: '#12304A' }}>{row.name}</div>
          <div className="text-xs text-muted">Batch #: {row.batchNumber}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'category',
      sortable: true,
      render: (row) => (
        <span className="badge" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 600 }}>
          {row.category}
        </span>
      ),
    },
    {
      header: 'Stock Quantity',
      key: 'currentStock',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-sm" style={{ color: '#12304A' }}>
            {row.currentStock} {row.unit}
          </span>
          <div className="text-xs text-muted">Min Threshold: {row.minStockThreshold}</div>
        </div>
      ),
    },
    {
      header: 'Supplier Info',
      key: 'supplierName',
      render: (row) => <span className="text-xs font-medium">{row.supplierName}</span>,
    },
    {
      header: 'Expiry Date',
      key: 'expiryDate',
      sortable: true,
      render: (row) => <span className="text-xs font-mono">{row.expiryDate}</span>,
    },
    {
      header: 'Stock Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
              READ-ONLY PHARMACY CATALOG
            </span>
            <span className="badge badge-secondary text-xs flex items-center gap-1">
              <Shield size={12} /> Staff View Only
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>
            Clinical Inventory Directory
          </h2>
          <p className="text-sm text-muted">
            Check live product quantities, lot batch numbers, stock status, and expiration dates.
          </p>
        </div>
      </div>

      {/* Stock Summary Metrics */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Total Catalog Items"
          value={totalItems}
          icon={Package}
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="#E76F51"
          trend="Inventory SKUs"
        />
        <StatCard
          label="In Stock & Ready"
          value={inStockCount}
          icon={CheckCircle}
          iconBg="rgba(16, 185, 129, 0.15)"
          iconColor="#10B981"
          trend="Sufficient buffer"
        />
        <StatCard
          label="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          iconBg="rgba(244, 162, 97, 0.15)"
          iconColor="#F4A261"
          trend="Below reorder limit"
        />
        <StatCard
          label="Out of Stock Items"
          value={outOfStockCount}
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="var(--status-danger)"
          trend="Zero stock"
        />
      </div>

      {/* Read-Only Notice Banner */}
      <div
        className="card p-4 mb-6"
        style={{ backgroundColor: '#FFF8F3', border: '1px solid #FEE2E2', borderRadius: 'var(--radius-lg)' }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#12304A' }}>
          <Shield size={16} color="#E76F51" />
          <span>
            Staff Notice: You have read-only access to view pharmacy and clinical supply levels. Restocking, adding new SKUs, and purchase order management are reserved for Clinic Managers.
          </span>
        </div>
      </div>

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
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Read-Only Data Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Search inventory by item name, SKU, supplier, batch..."
        emptyMessage="No inventory items match the selected filters."
      />
    </div>
  );
};
