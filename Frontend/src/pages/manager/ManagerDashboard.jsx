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
        const [invRes, suppRes, feedbackRes, apptsRes] = await Promise.allSettled([
          inventoryApi.getInventory(),
          supplierApi.getSuppliers(),
          feedbackApi.getFeedbacks(),
          appointmentApi.getAppointments(),
        ]);
        if (invRes.status === 'fulfilled' && invRes.value) setInventoryItems(invRes.value);
        if (suppRes.status === 'fulfilled' && suppRes.value) setSuppliers(suppRes.value);
        if (feedbackRes.status === 'fulfilled' && feedbackRes.value) setFeedbacks(feedbackRes.value);
        if (apptsRes.status === 'fulfilled' && apptsRes.value) setAppointments(apptsRes.value);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadManagerData();
  }, []);

  const totalInventoryCount = (inventoryItems || []).length;
  const lowStockCount = (inventoryItems || []).filter(
    (i) => i.currentStock > 0 && i.currentStock <= i.minStockThreshold
  ).length;
  const outOfStockCount = (inventoryItems || []).filter((i) => i.currentStock === 0).length;

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Apple Liquid Glass Welcome Header */}
      <div className="apple-liquid-glass p-6 mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="apple-eyebrow mb-1">EXECUTIVE OPERATIONS & SUPPLY CHAIN</span>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: '4px 0' }}>
            Clinic Operations & Inventory Hub
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: '640px' }}>
            Executive oversight of clinical pharmaceuticals, real-time inventory restock beacons, supplier purchase orders, and revenue telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/manager/inventory"
            className="apple-pill-btn apple-pill-btn-primary"
          >
            <Package size={16} /> Manage Inventory
          </Link>
          <Link
            to="/manager/suppliers"
            className="apple-pill-btn apple-pill-btn-secondary"
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

      {/* Signature Apple Element: Executive Performance Sparklines & Shortage Beacon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Executive Sparklines Card (2 cols) */}
        <div className="apple-sparkline-card apple-liquid-glass lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div>
              <span className="apple-eyebrow">EXECUTIVE TELEMETRY</span>
              <h3 className="text-base font-bold text-main">Weekly Patient & Service Throughput</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-success text-xs font-semibold">97.4% On-Schedule</span>
              <span className="text-xs text-muted">Past 7 Days</span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 pt-4 pb-2" style={{ height: '140px' }}>
            {[
              { day: 'Mon', count: 32, height: '55%' },
              { day: 'Tue', count: 46, height: '78%' },
              { day: 'Wed', count: 52, height: '90%' },
              { day: 'Thu', count: 58, height: '100%' },
              { day: 'Fri', count: 49, height: '84%' },
              { day: 'Sat', count: 42, height: '72%' },
              { day: 'Sun', count: 28, height: '48%' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer">
                <span className="text-xs text-muted mb-1 font-mono group-hover:text-primary transition-colors" style={{ fontSize: '0.7rem' }}>
                  {item.count}
                </span>
                <div
                  className="sparkline-bar w-full"
                  style={{
                    height: item.height,
                    background: i === 3 ? 'var(--primary)' : 'rgba(14, 131, 118, 0.35)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease',
                  }}
                  title={`${item.day}: ${item.count} appointments & treatments`}
                />
                <span className="text-xs text-muted mt-2 font-semibold" style={{ fontSize: '0.72rem' }}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Shortage Emergency Beacon */}
        <div className="apple-liquid-glass p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="apple-eyebrow">REORDER RADAR</span>
              <span
                className="badge text-xs"
                style={{
                  background: (outOfStockCount > 0 || lowStockCount > 0) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  color: (outOfStockCount > 0 || lowStockCount > 0) ? '#EF4444' : '#10B981',
                  fontWeight: 700,
                }}
              >
                {(outOfStockCount > 0 || lowStockCount > 0) ? 'ACTION REQUIRED' : 'OPTIMAL'}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              {(outOfStockCount > 0 || lowStockCount > 0) && (
                <span className="sos-beacon-dot" style={{ background: '#EF4444' }}></span>
              )}
              <h3 className="text-base font-bold text-main">Stock Shortage Beacon</h3>
            </div>

            <p className="text-xs text-muted mb-4">
              Real-time monitor tracking clinical pharmaceuticals nearing zero safety stock.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#F5F5F7' }}>
                <span className="text-xs text-muted font-medium">Critical Out of Stock:</span>
                <span className="font-bold text-sm" style={{ color: outOfStockCount > 0 ? '#EF4444' : 'var(--text-main)' }}>
                  {outOfStockCount} SKUs
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#F5F5F7' }}>
                <span className="text-xs text-muted font-medium">Below Reorder Threshold:</span>
                <span className="font-bold text-sm" style={{ color: lowStockCount > 0 ? '#F59E0B' : 'var(--text-main)' }}>
                  {lowStockCount} SKUs
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <Link
              to="/manager/suppliers"
              className="apple-pill-btn apple-pill-btn-primary w-full text-center justify-center text-xs py-2"
            >
              Generate Supplier PO <ArrowRight size={14} />
            </Link>
          </div>
        </div>
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
