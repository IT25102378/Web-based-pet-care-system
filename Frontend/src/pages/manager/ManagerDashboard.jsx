import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryApi } from '../../api/inventoryApi';
import { supplierApi } from '../../api/supplierApi';
import { appointmentApi } from '../../api/appointmentApi';
import { feedbackApi } from '../../api/feedbackApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  BarChart3,
  Package,
  Truck,
  Layers,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const ManagerDashboard = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManagerData = async () => {
      try {
        const [invList, suppList, feedbackList, appts] = await Promise.all([
          inventoryApi.getInventory(),
          supplierApi.getSuppliers(),
          feedbackApi.getFeedbacks(),
          appointmentApi.getAppointments(),
        ]);
        setInventoryItems(invList);
        setSuppliers(suppList);
        setFeedbacks(feedbackList);
        setAppointments(appts);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadManagerData();
  }, []);

  const totalInventoryCount = inventoryItems.length;
  const lowStockCount = inventoryItems.filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold
  ).length;
  const outOfStockCount = inventoryItems.filter((i) => i.currentStock === 0).length;

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Welcome Header */}
      <div
        style={{
          backgroundColor: '#FFF8F3',
          border: '1px solid #FEE2E2',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(231, 111, 81, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            className="badge mb-1"
            style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}
          >
            FULL INVENTORY MANAGEMENT & OPERATIONS
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>
            Clinic Manager Hub
          </h2>
          <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
            Executive oversight of clinical inventory SKUs, restocking levels, supplier orders, and staff approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/manager/inventory"
            className="btn"
            style={{
              backgroundColor: '#E76F51',
              color: '#FFFFFF',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
            }}
          >
            <Package size={16} /> Manage Inventory
          </Link>
          <Link
            to="/manager/suppliers"
            className="btn"
            style={{ backgroundColor: '#12304A', color: '#FFFFFF', fontWeight: 600 }}
          >
            <Truck size={16} /> Supplier POs
          </Link>
        </div>
      </div>

      {/* Required Manager Metrics: Total Items, Low Stock, Out of Stock, Monthly Revenue */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Total Inventory Items"
          value={totalInventoryCount}
          icon={Package}
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="#E76F51"
          trend="Catalog SKUs"
        />
        <StatCard
          label="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          iconBg="rgba(244, 162, 97, 0.15)"
          iconColor="#F4A261"
          trend="Needs restocking"
          trendDirection="down"
        />
        <StatCard
          label="Out of Stock Items"
          value={outOfStockCount}
          icon={AlertTriangle}
          iconBg="rgba(239, 68, 68, 0.15)"
          iconColor="var(--status-danger)"
          trend="Critical zero stock"
          trendDirection="down"
        />
        <StatCard
          label="Gross Revenue"
          value="Rs. 13,250,000"
          icon={TrendingUp}
          trend="+14.2% YoY"
          trendDirection="up"
        />
      </div>

      {/* Main Manager Inventory & Supply Chain Section */}
      <div className="grid-2 mb-8">
        {/* Inventory Catalog Table Preview */}
        <Card
          title="Clinical Inventory Overview"
          subtitle="Real-time stock quantities & reorder thresholds"
          icon={Package}
          actions={
            <Link to="/manager/inventory" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
              Full Inventory Management <ArrowRight size={14} />
            </Link>
          }
        >
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.slice(0, 5).map((item) => (
                  <tr key={item.itemId}>
                    <td className="font-mono text-xs font-bold" style={{ color: '#E76F51' }}>{item.sku}</td>
                    <td className="font-bold text-xs" style={{ color: '#12304A' }}>{item.name}</td>
                    <td className="text-xs">
                      <strong>{item.currentStock}</strong> {item.unit} (Min: {item.minStockThreshold})
                    </td>
                    <td><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Supplier & Restocking/Purchase Info Preview */}
        <Card
          title="Restocking & Supplier Information"
          subtitle="Vendor directory & purchase order status"
          icon={Truck}
          actions={
            <Link to="/manager/suppliers" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
              Manage Suppliers <ArrowRight size={14} />
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Restocking Summary */}
            <div
              style={{
                padding: '0.85rem 1rem',
                backgroundColor: '#FFF8F3',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #FEE2E2',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs" style={{ color: '#12304A' }}>Active Purchase Order Pipeline</span>
                <span className="badge badge-warning text-xs">2 Orders Pending</span>
              </div>
              <p className="text-xs text-muted">
                Estimated restocking arrival: <strong>3-5 business days</strong> via Zoetis & Covetrus.
              </p>
            </div>

            {/* Supplier Directory Overview */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#12304A' }}>
                Primary Suppliers ({suppliers.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {suppliers.slice(0, 3).map((supp) => (
                  <div
                    key={supp.supplierId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <div>
                      <span className="font-bold" style={{ color: '#12304A' }}>{supp.companyName}</span>
                      <p className="text-xs text-muted">{supp.category} • Lead Time: {supp.leadTimeDays} days</p>
                    </div>
                    <span className="badge badge-success text-xs">Verified Vendor</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Executive Modules Grid */}
      <div className="grid-3">
        <Card
          title="Package & Promo Management"
          subtitle="Wellness care plans & pricing"
          icon={Layers}
          actions={
            <Link to="/manager/packages" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
              Manage <ArrowRight size={14} />
            </Link>
          }
        >
          <p className="text-xs text-muted mb-3">
            Create annual care packages, configure discount structures, and monitor subscriber enrollment.
          </p>
          <Link to="/manager/packages" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Care Packages Catalog
          </Link>
        </Card>

        <Card
          title="Client Feedback & Quality"
          subtitle="Customer satisfaction & reviews"
          icon={MessageSquare}
          actions={
            <Link to="/manager/feedback" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
              View All ({feedbacks.length}) <ArrowRight size={14} />
            </Link>
          }
        >
          <p className="text-xs text-muted mb-3">
            Review pet owner ratings, monitor clinic service satisfaction, and audit feedback trends.
          </p>
          <Link to="/manager/feedback" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Feedback & Reviews ({feedbacks.length})
          </Link>
        </Card>

        <Card
          title="Performance Reports"
          subtitle="Clinical & financial analytics"
          icon={BarChart3}
          actions={
            <Link to="/manager/reports" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
              Reports <ArrowRight size={14} />
            </Link>
          }
        >
          <p className="text-xs text-muted mb-3">
            Inspect revenue distributions, patient volume trends, and shelter adoption outcomes.
          </p>
          <Link to="/manager/reports" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Operational Analytics
          </Link>
        </Card>
      </div>
    </div>
  );
};
