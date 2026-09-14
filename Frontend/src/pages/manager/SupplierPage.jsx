import React, { useState, useEffect } from 'react';
import { supplierApi } from '../../api/supplierApi';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { Truck, Plus, Send, Phone, Mail, MapPin, Star, Check, Edit2, Trash2 } from 'lucide-react';

export const SupplierPage = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [poSupplier, setPoSupplier] = useState(null);
  const [poItems, setPoItems] = useState('Rabies Vaccine (10 packs), Apoquel 16mg (5 bottles)');
  const [poAmount, setPoAmount] = useState(385000.00);

  const [newSupplier, setNewSupplier] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'Pharmaceuticals & Vaccines',
    leadTimeDays: 2,
    rating: 5.0,
    address: '',
  });

  const [editSupplierData, setEditSupplierData] = useState(null);

  const loadSuppliers = async () => {
    try {
      const list = await supplierApi.getSuppliers();
      setSuppliers(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const validateSupplier = (data) => {
    if (!data.companyName || !data.companyName.trim()) {
      showToast('Validation Error', 'Company name is required.', 'error');
      return false;
    }
    if (!data.email || !data.email.trim()) {
      showToast('Validation Error', 'Email address is required.', 'error');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      showToast('Validation Error', 'Please provide a valid email address.', 'error');
      return false;
    }
    if (data.leadTimeDays !== undefined && (isNaN(data.leadTimeDays) || Number(data.leadTimeDays) < 0)) {
      showToast('Validation Error', 'Lead time must be a positive number of days (0 or greater).', 'error');
      return false;
    }
    if (data.rating !== undefined && (isNaN(data.rating) || Number(data.rating) < 0 || Number(data.rating) > 5)) {
      showToast('Validation Error', 'Rating must be between 0.0 and 5.0.', 'error');
      return false;
    }
    return true;
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    if (!poSupplier) return;
    try {
      const res = await supplierApi.createPurchaseOrder({
        supplierId: poSupplier.supplierId,
        supplierName: poSupplier.companyName,
        itemsDescription: poItems,
        totalAmount: poAmount,
      });
      showToast('Order Dispatched', `Purchase Order #${res.orderId} sent to ${poSupplier.companyName}`, 'success');
      setPoSupplier(null);
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!validateSupplier(newSupplier)) return;
    try {
      await supplierApi.addSupplier({
        ...newSupplier,
        leadTimeDays: Number(newSupplier.leadTimeDays) || 0,
        rating: Number(newSupplier.rating) || 5.0,
      });
      showToast('Supplier Added', `${newSupplier.companyName} added to directory.`, 'success');
      setIsAddModalOpen(false);
      setNewSupplier({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        category: 'Pharmaceuticals & Vaccines',
        leadTimeDays: 2,
        rating: 5.0,
        address: '',
      });
      loadSuppliers();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleOpenEdit = (supplier) => {
    setEditSupplierData({
      supplierId: supplier.supplierId,
      companyName: supplier.companyName || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      category: supplier.category || 'Pharmaceuticals & Vaccines',
      leadTimeDays: supplier.leadTimeDays ?? 2,
      rating: supplier.rating ?? 5.0,
      address: supplier.address || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditSupplier = async (e) => {
    e.preventDefault();
    if (!editSupplierData || !validateSupplier(editSupplierData)) return;
    try {
      await supplierApi.updateSupplier(editSupplierData.supplierId, {
        companyName: editSupplierData.companyName.trim(),
        contactPerson: editSupplierData.contactPerson.trim(),
        email: editSupplierData.email.trim(),
        phone: editSupplierData.phone.trim(),
        category: editSupplierData.category,
        leadTimeDays: Number(editSupplierData.leadTimeDays) || 0,
        rating: Number(editSupplierData.rating) || 5.0,
        address: editSupplierData.address.trim(),
      });
      showToast('Supplier Updated', `${editSupplierData.companyName} details updated successfully.`, 'success');
      setIsEditModalOpen(false);
      setEditSupplierData(null);
      loadSuppliers();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;
    try {
      await supplierApi.deleteSupplier(supplierToDelete.supplierId);
      showToast('Supplier Removed', `${supplierToDelete.companyName} removed from active vendors.`, 'info');
      setSupplierToDelete(null);
      loadSuppliers();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Supplier ID',
      key: 'supplierId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.supplierId}</span>,
    },
    {
      header: 'Vendor Company',
      key: 'companyName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.companyName}</div>
          <div className="text-xs text-muted">Rep: {row.contactPerson}</div>
        </div>
      ),
    },
    {
      header: 'Supply Category',
      key: 'category',
      render: (row) => <span className="badge badge-secondary text-xs">{row.category}</span>,
    },
    {
      header: 'Contact Email & Phone',
      key: 'email',
      render: (row) => (
        <div className="text-xs">
          <div>{row.email}</div>
          <div className="text-muted">{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Lead Time',
      key: 'leadTimeDays',
      sortable: true,
      render: (row) => <span className="text-xs font-semibold">{row.leadTimeDays} Business Days</span>,
    },
    {
      header: 'Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-bold text-amber">
          <Star size={14} fill="#F59E0B" color="#F59E0B" /> {row.rating}
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEdit(row)}
            title="Edit Supplier Details"
          >
            <Edit2 size={13} /> Edit
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setPoSupplier(row)}
            title="Create Purchase Order"
          >
            <Send size={13} /> Order PO
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => setSupplierToDelete(row)}
            title="Deactivate / Delete Vendor"
            style={{ color: '#EF4444' }}
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
          <span className="badge badge-primary mb-1">VENDOR MANAGEMENT</span>
          <h2>Medical & Veterinary Suppliers</h2>
          <p className="text-sm text-muted">
            Directory of verified pharmaceutical distributors, surgical equipment vendors, and purchase order dispatches.
          </p>
        </div>

        <button type="button" className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Vendor Partner
        </button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search suppliers by company, category, contact, email, phone..."
        emptyMessage="No suppliers found."
      />

      {/* Place Purchase Order Modal */}
      {poSupplier && (
        <Modal
          isOpen={!!poSupplier}
          onClose={() => setPoSupplier(null)}
          title={`Create Purchase Order: ${poSupplier.companyName}`}
          subtitle={`Lead Time: ${poSupplier.leadTimeDays} Days • Category: ${poSupplier.category}`}
          size="md"
        >
          <form onSubmit={handleCreatePo}>
            <div className="form-group">
              <label className="form-label">Order Line Items & Quantities <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                value={poItems}
                onChange={(e) => setPoItems(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Order Value (Rs.) <span className="required">*</span></label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={poAmount}
                onChange={(e) => setPoAmount(Number(e.target.value))}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setPoSupplier(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Transmit Purchase Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Vendor Partner"
          size="md"
        >
          <form onSubmit={handleAddSupplier}>
            <div className="form-group">
              <label className="form-label">Company Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={newSupplier.companyName}
                onChange={(e) => setNewSupplier({ ...newSupplier, companyName: e.target.value })}
                placeholder="e.g. MedVet Pharmaceuticals Ltd"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Account Rep Contact</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="e.g. Samantha Fernando"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="orders@supplier.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telephone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+94 11 234 5678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Category</label>
                <select
                  className="form-select"
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                >
                  <option value="Pharmaceuticals & Vaccines">Pharmaceuticals & Vaccines</option>
                  <option value="Surgical & Clinical Equipment">Surgical & Clinical Equipment</option>
                  <option value="Prescription Diets & Nutrition">Prescription Diets & Nutrition</option>
                  <option value="Diagnostic Lab Consumables">Diagnostic Lab Consumables</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lead Time (Business Days)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={newSupplier.leadTimeDays}
                  onChange={(e) => setNewSupplier({ ...newSupplier, leadTimeDays: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating (0.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="form-control"
                  value={newSupplier.rating}
                  onChange={(e) => setNewSupplier({ ...newSupplier, rating: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Facility / Street Address</label>
              <input
                type="text"
                className="form-control"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                placeholder="e.g. 55 Union Place, Colombo 02"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Supplier Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Supplier Modal */}
      {isEditModalOpen && editSupplierData && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditSupplierData(null);
          }}
          title={`Edit Supplier: ${editSupplierData.companyName}`}
          subtitle={`Supplier ID: ${editSupplierData.supplierId}`}
          size="md"
        >
          <form onSubmit={handleSaveEditSupplier}>
            <div className="form-group">
              <label className="form-label">Company Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editSupplierData.companyName}
                onChange={(e) => setEditSupplierData({ ...editSupplierData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Account Rep Contact</label>
                <input
                  type="text"
                  className="form-control"
                  value={editSupplierData.contactPerson}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, contactPerson: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-control"
                  value={editSupplierData.email}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Telephone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={editSupplierData.phone}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Category</label>
                <select
                  className="form-select"
                  value={editSupplierData.category}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, category: e.target.value })}
                >
                  <option value="Pharmaceuticals & Vaccines">Pharmaceuticals & Vaccines</option>
                  <option value="Surgical & Clinical Equipment">Surgical & Clinical Equipment</option>
                  <option value="Prescription Diets & Nutrition">Prescription Diets & Nutrition</option>
                  <option value="Diagnostic Lab Consumables">Diagnostic Lab Consumables</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Lead Time (Business Days)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={editSupplierData.leadTimeDays}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, leadTimeDays: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating (0.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className="form-control"
                  value={editSupplierData.rating}
                  onChange={(e) => setEditSupplierData({ ...editSupplierData, rating: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Facility / Street Address</label>
              <input
                type="text"
                className="form-control"
                value={editSupplierData.address}
                onChange={(e) => setEditSupplierData({ ...editSupplierData, address: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditSupplierData(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate Supplier Modal */}
      {supplierToDelete && (
        <Modal
          isOpen={!!supplierToDelete}
          onClose={() => setSupplierToDelete(null)}
          title="Deactivate Vendor Partner"
          subtitle={`Are you sure you want to deactivate "${supplierToDelete.companyName}" (${supplierToDelete.supplierId})?`}
          size="sm"
          footer={
            <div className="flex items-center justify-end gap-2" style={{ width: '100%' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSupplierToDelete(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}
                onClick={handleDeleteSupplier}
              >
                <Trash2 size={16} /> Confirm Deactivate
              </button>
            </div>
          }
        >
          <p className="text-sm text-muted">
            Deactivating this vendor will archive their catalog association. Historical purchase orders and invoice references remain intact for audit logs.
          </p>
        </Modal>
      )}
    </div>
  );
};

