import React, { useState, useEffect } from 'react';
import { packageApi } from '../../api/packageApi';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Layers, Plus, Edit2, CheckCircle, Check, Tag, Power } from 'lucide-react';

export const PackageManagementPage = () => {
  const { showToast } = useToast();
  const [packages, setPackages] = useState([]);
  const [editingPackage, setEditingPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    price: 55000.00,
    originalValue: 72000.00,
    discountPercent: 23,
    badge: 'Popular',
    features: '',
    recommendedFor: 'All pets',
  });

  const loadPackages = async () => {
    try {
      const list = await packageApi.getPackages();
      setPackages(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      tagline: '',
      price: 55000.00,
      originalValue: 72000.00,
      discountPercent: 23,
      badge: 'New Package',
      features: 'Doctor Consultation\nFull Blood Screen\nAnnual Vaccine Boosters',
      recommendedFor: 'All pets',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      ...pkg,
      features: Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.features || ''),
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (pkg) => {
    try {
      const willActivate = pkg.active === false ? true : false;
      await packageApi.togglePackageStatus(pkg.packageId, willActivate);
      showToast('Status Updated', `${pkg.name} is now ${willActivate ? 'Active' : 'Deactivated'}.`, 'info');
      loadPackages();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast('Validation Error', 'Package name and price are required.', 'error');
      return;
    }

    const featureList = typeof formData.features === 'string'
      ? formData.features.split('\n').map((s) => s.trim()).filter(Boolean)
      : (Array.isArray(formData.features) ? formData.features : []);

    try {
      if (editingPackage) {
        await packageApi.updatePackage(editingPackage.packageId, {
          ...formData,
          features: featureList,
        });
        showToast('Package Updated', `${formData.name} updated successfully.`, 'success');
      } else {
        await packageApi.createPackage({
          ...formData,
          features: featureList,
        });
        showToast('Package Created', `${formData.name} added to clinic offerings.`, 'success');
      }
      setIsModalOpen(false);
      loadPackages();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">PROMOTIONS & CARE PLANS</span>
          <h2>Wellness Packages & Pricing Plans</h2>
          <p className="text-sm text-muted">
            Configure clinic bundled health plans, promotional discount pricing, and client inclusions.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={16} /> Create Care Package
        </button>
      </div>

      <div className="grid-2">
        {packages.map((pkg) => (
          <div
            key={pkg.packageId}
            className="card p-6"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: pkg.active === false ? 0.65 : 1,
              borderLeft: pkg.active === false ? '4px solid var(--border-medium)' : '4px solid var(--primary)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">{pkg.badge || 'Wellness Plan'}</span>
                  <span className={`badge ${pkg.active === false ? 'badge-secondary' : 'badge-success'} text-xs`}>
                    {pkg.active === false ? 'Inactive' : 'Active'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleToggleStatus(pkg)}
                    title={pkg.active === false ? 'Activate package' : 'Deactivate package'}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Power size={12} /> {pkg.active === false ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleOpenEdit(pkg)}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  >
                    <Edit2 size={12} /> Edit Plan
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.3rem' }}>{pkg.name}</h3>
              <p className="text-xs text-muted mb-4">{pkg.tagline || pkg.description}</p>

              <div className="flex items-baseline gap-2 mb-4">
                <span style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                  Rs. {Number(pkg.price).toLocaleString()}
                </span>
                {pkg.originalValue > pkg.price && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-subtle)', fontSize: '1rem' }}>
                    Rs. {Number(pkg.originalValue).toLocaleString()}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {pkg.features?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-main">
                    <CheckCircle size={14} color="var(--status-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted pt-3 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
              Recommended: <strong>{pkg.recommendedFor || 'All pets'}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingPackage ? `Edit Plan: ${editingPackage.name}` : 'Create New Care Plan'}
          size="md"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Package Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Marketing Tagline</label>
              <input
                type="text"
                className="form-control"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Special Package Price (Rs.) <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Standard Value (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={formData.originalValue}
                  onChange={(e) => setFormData({ ...formData, originalValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Badge Text (e.g. Best Seller, Senior Special)</label>
              <input
                type="text"
                className="form-control"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Inclusions & Features (One per line)</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Doctor Consultation&#10;Rabies Vaccine&#10;Dental Checkup"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Package Plan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
