import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { useToast } from '../../context/ToastContext';
import { Home, User, Phone, MapPin, Star, Plus, Edit2, Check, Trash2, AlertTriangle } from 'lucide-react';

export const FosterManagementPage = () => {
  const { showToast } = useToast();
  const [fosters, setFosters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editFoster, setEditFoster] = useState(null);
  const [fosterToDelete, setFosterToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    homeType: 'Single family home with fenced yard',
    activePlacements: 0,
    maxCapacity: 2,
    rating: 5.0,
    status: 'Active',
  });

  const fetchFosters = async () => {
    setLoading(true);
    try {
      const list = await rescueApi.getFosterRecords();
      setFosters(list || []);
    } catch (err) {
      showToast('Error', err.message || 'Failed to load foster parent roster.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFosters();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      homeType: 'Single family home with fenced yard',
      activePlacements: 0,
      maxCapacity: 2,
      rating: 5.0,
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditFoster(record);
    setFormData({
      fullName: record.fullName || '',
      phone: record.phone || '',
      email: record.email || '',
      address: record.address || '',
      homeType: record.homeType || 'Single family home with fenced yard',
      activePlacements: record.activePlacements ?? 0,
      maxCapacity: record.maxCapacity ?? 2,
      rating: record.rating ?? 5.0,
      status: record.status || 'Active',
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Validation Error', 'Full name is required.', 'error');
      return;
    }
    try {
      await rescueApi.createFosterRecord({
        ...formData,
        activePlacements: Number(formData.activePlacements) || 0,
        maxCapacity: Number(formData.maxCapacity) || 2,
        rating: Number(formData.rating) || 5.0,
      });
      showToast('Foster Registered', `${formData.fullName} has been added to the foster roster.`, 'success');
      setIsAddModalOpen(false);
      fetchFosters();
    } catch (err) {
      showToast('Error', err.message || 'Failed to save foster record.', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showToast('Validation Error', 'Full name is required.', 'error');
      return;
    }
    try {
      await rescueApi.updateFosterRecord(editFoster.fosterId, {
        ...formData,
        activePlacements: Number(formData.activePlacements) || 0,
        maxCapacity: Number(formData.maxCapacity) || 2,
        rating: Number(formData.rating) || 5.0,
      });
      showToast('Foster Updated', `Updated foster profile for ${formData.fullName}.`, 'success');
      setEditFoster(null);
      fetchFosters();
    } catch (err) {
      showToast('Error', err.message || 'Failed to update foster record.', 'error');
    }
  };

  const handleDeleteFoster = async () => {
    if (!fosterToDelete) return;
    setIsDeleting(true);
    try {
      await rescueApi.deleteFosterRecord(fosterToDelete.fosterId);
      showToast('Foster Removed', `${fosterToDelete.fullName} has been removed from the foster roster.`, 'info');
      setFosterToDelete(null);
      fetchFosters();
    } catch (err) {
      showToast('Delete Failed', err.message || 'Could not delete foster record.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Foster Parent',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.fullName}</div>
          <div className="text-xs text-muted">{row.email || 'No email'} • {row.phone || 'No phone'}</div>
        </div>
      ),
    },
    {
      header: 'Housing & Yard Environment',
      key: 'homeType',
      render: (row) => <span className="text-xs text-main">{row.homeType}</span>,
    },
    {
      header: 'Address',
      key: 'address',
      render: (row) => <span className="text-xs text-muted">{row.address || 'Unspecified'}</span>,
    },
    {
      header: 'Capacity & Active',
      key: 'activePlacements',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="badge badge-primary text-xs">
            {row.activePlacements} / {row.maxCapacity} Occupied
          </span>
        </div>
      ),
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#F59E0B' }}>
          <Star size={14} fill="#F59E0B" /> {row.rating} / 5
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`badge ${row.status === 'Active' ? 'badge-success' : 'badge-secondary'} text-xs`}>
          {row.status || 'Active'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Edit Foster Profile"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            title="Remove Foster Parent"
            onClick={() => setFosterToDelete(row)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-warning mb-1">FOSTER ROSTER</span>
          <h2>Foster Parent Management</h2>
          <p className="text-sm text-muted">
            Directory of verified foster volunteer homes, capacity limits, and current rehabilitation assignments.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Register Foster Parent
        </button>
      </div>

      <DataTable
        columns={columns}
        data={fosters}
        searchPlaceholder="Search foster parents by name, home type, phone..."
        emptyMessage="No foster parent records found."
      />

      {/* Add Foster Parent Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register Foster Parent"
          subtitle="Add a certified volunteer foster home to the rescue network."
          size="lg"
        >
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label font-bold text-xs">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
              />
            </div>

            <div className="grid-2 gap-4">
              <div className="form-group">
                <label className="form-label font-bold text-xs">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah.jenkins@example.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-xs">Physical Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="No. 142, Havelock Road, Colombo 05"
              />
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-xs">Housing & Yard Type</label>
              <input
                type="text"
                className="form-control"
                value={formData.homeType}
                onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
                placeholder="Single family home with 6ft fenced yard"
              />
            </div>

            <div className="grid-3 gap-4">
              <div className="form-group">
                <label className="form-label font-bold text-xs">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-control"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Rating (0 - 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="form-control"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
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
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Foster Parent
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Foster Parent Modal */}
      {editFoster && (
        <Modal
          isOpen={true}
          onClose={() => setEditFoster(null)}
          title={`Edit Foster Parent: ${editFoster.fullName}`}
          size="lg"
        >
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label font-bold text-xs">Full Name <span className="text-danger">*</span></label>
              <input
                type="text"
                required
                className="form-control"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="grid-2 gap-4">
              <div className="form-group">
                <label className="form-label font-bold text-xs">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-xs">Physical Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label font-bold text-xs">Housing & Yard Type</label>
              <input
                type="text"
                className="form-control"
                value={formData.homeType}
                onChange={(e) => setFormData({ ...formData, homeType: e.target.value })}
              />
            </div>

            <div className="grid-3 gap-4">
              <div className="form-group">
                <label className="form-label font-bold text-xs">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-control"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Rating (0 - 5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  className="form-control"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label font-bold text-xs">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditFoster(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Update Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Foster Parent Confirmation Modal */}
      {fosterToDelete && (
        <Modal
          isOpen={Boolean(fosterToDelete)}
          onClose={() => setFosterToDelete(null)}
          title="Remove Foster Volunteer"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle size={28} />
              <div>
                <h4 className="text-base font-bold text-main">Confirm Foster Deactivation</h4>
                <p className="text-xs text-muted">
                  Are you sure you want to remove <strong>{fosterToDelete.fullName}</strong> from the active foster registry?
                  Any ongoing pet rehabilitation placements should be transferred first.
                </p>
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setFosterToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteFoster} disabled={isDeleting}>
                <Trash2 size={16} /> {isDeleting ? 'Removing...' : 'Remove from Roster'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
