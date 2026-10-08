import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PublishListingModal } from '../../components/common/PublishListingModal';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  FolderOpen,
  PlusCircle,
  Eye,
  Heart,
  Home,
  Globe,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

export const RescueCaseListPage = () => {
  const { showToast } = useToast();
  const [cases, setCases] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' or 'PENDING_REPORTS'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCaseForListing, setSelectedCaseForListing] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [acceptingCaseId, setAcceptingCaseId] = useState(null);

  // Quick Edit & Delete State
  const [editingCase, setEditingCase] = useState(null);
  const [editFormData, setEditFormData] = useState({
    temporaryName: '',
    species: '',
    breed: '',
    rescueLocation: '',
    conditionSeverity: 'Moderate',
    description: '',
  });
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCases = async () => {
    const list = await rescueApi.getRescueCases();
    setCases(list || []);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const pendingReports = cases.filter((c) => c.status === 'Reported');
  const officialRosterCases = cases.filter((c) => c.status !== 'Reported');

  const filtered = cases.filter((c) => {
    if (activeTab === 'PENDING_REPORTS') {
      return c.status === 'Reported';
    }
    // 'ALL' tab
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const handleAcceptReport = async (caseItem) => {
    setAcceptingCaseId(caseItem.caseId);
    try {
      await rescueApi.acceptRescueReport(
        caseItem.caseId,
        `Animal received and admitted into clinic rescue registry by Rescue Team.`
      );
      showToast(
        'Animal Added to Rescued List!',
        `${caseItem.temporaryName} has been admitted to Intake Assessment and officially added to the Rescued Animals roster. The pet owner has been notified.`,
        'success'
      );
      await fetchCases();
    } catch (err) {
      showToast('Action Failed', err.message || 'Could not accept rescue report.', 'error');
    } finally {
      setAcceptingCaseId(null);
    }
  };

  const handleOpenQuickEdit = (row) => {
    setEditingCase(row);
    setEditFormData({
      temporaryName: row.temporaryName || '',
      species: row.species || '',
      breed: row.breed || '',
      rescueLocation: row.rescueLocation || '',
      conditionSeverity: row.conditionSeverity || 'Moderate',
      description: row.description || '',
    });
  };

  const handleSaveQuickEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.temporaryName.trim() || !editFormData.rescueLocation.trim()) {
      showToast('Validation Error', 'Temporary name and rescue location are required.', 'error');
      return;
    }
    try {
      await rescueApi.updateRescueCase(editingCase.caseId, {
        temporaryName: editFormData.temporaryName.trim(),
        species: editFormData.species,
        breed: editFormData.breed.trim(),
        rescueLocation: editFormData.rescueLocation.trim(),
        conditionSeverity: editFormData.conditionSeverity,
        description: editFormData.description.trim(),
      });
      showToast('Case Updated', `Intake details for ${editFormData.temporaryName} saved.`, 'success');
      setEditingCase(null);
      fetchCases();
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update rescue case.', 'error');
    }
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    setIsDeleting(true);
    try {
      await rescueApi.deleteRescueCase(caseToDelete.caseId);
      showToast('Case Archived', `Rescue record ${caseToDelete.caseNumber} (${caseToDelete.temporaryName}) removed.`, 'info');
      setCaseToDelete(null);
      fetchCases();
    } catch (err) {
      showToast('Delete Failed', err.message || 'Could not remove case.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Case #',
      key: 'caseNumber',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-xs text-primary">{row.caseNumber}</span>,
    },
    {
      header: 'Rescue Companion',
      key: 'temporaryName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.coverPhotoUrl}
            alt={row.temporaryName}
            style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-sm text-main">{row.temporaryName}</div>
            <div className="text-xs text-muted">{row.species} • {row.breed}</div>
            {row.reportedByUserName && (
              <div className="text-xs text-primary flex items-center gap-1 mt-0.5">
                <User size={11} /> Reported by: {row.reportedByUserName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Location / Intake',
      key: 'rescueLocation',
      render: (row) => (
        <div>
          <div className="text-xs font-semibold text-main flex items-center gap-1">
            <MapPin size={12} style={{ color: 'var(--accent)' }} /> {row.rescueLocation}
          </div>
          <div className="text-xs text-muted mt-0.5">Date: {row.intakeDate}</div>
        </div>
      ),
    },
    {
      header: 'Severity',
      key: 'conditionSeverity',
      render: (row) => (
        <span
          className={`badge ${
            row.conditionSeverity === 'Critical' || row.conditionSeverity === 'High'
              ? 'badge-danger'
              : row.conditionSeverity === 'Moderate'
              ? 'badge-warning'
              : 'badge-secondary'
          }`}
        >
          {row.conditionSeverity}
        </span>
      ),
    },
    {
      header: 'Current Status',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2 flex-wrap">
          {row.status === 'Reported' ? (
            <button
              type="button"
              className="btn btn-accent btn-sm flex items-center gap-1"
              disabled={acceptingCaseId === row.caseId}
              onClick={() => handleAcceptReport(row)}
              style={{ fontWeight: 700 }}
              title="Admit into clinic intake queue and add to rescued animals list"
            >
              <CheckCircle size={14} />
              {acceptingCaseId === row.caseId ? 'Admitting...' : 'Accept & Add to Rescued List'}
            </button>
          ) : (
            <>
              {(row.status === 'ReadyForAdoption' || row.status === 'InFoster') && !row.isPublishedForAdoption && (
                <button
                  type="button"
                  className="btn btn-accent btn-sm flex items-center gap-1"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                  onClick={() => {
                    setSelectedCaseForListing(row);
                    setIsListingModalOpen(true);
                  }}
                >
                  <Heart size={12} fill="#FFFFFF" /> List for Adoption
                </button>
              )}
            </>
          )}

          <Link to={`/rescue/cases/${row.caseId}`} className="btn btn-secondary btn-sm">
            <Eye size={14} /> Case Details
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Quick Edit Intake Details"
            onClick={() => handleOpenQuickEdit(row)}
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            title="Archive / Remove Case"
            onClick={() => setCaseToDelete(row)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header Banner */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-warning mb-1">CASE ROSTER</span>
          <h2>Rescue Cases Repository</h2>
          <p className="text-sm text-muted">
            Search and monitor all active animal intakes, community rescue reports, medical logs, foster placements, and finalized adoptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/rescue/register-case" className="btn btn-accent">
            <PlusCircle size={16} /> Direct Intake
          </Link>
        </div>
      </div>

      {/* Tabs Row: All Cases vs Incoming Community Reports */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid var(--border)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setActiveTab('ALL')}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'ALL' ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === 'ALL' ? 'var(--primary-dark)' : 'var(--text-muted)',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
            }}
          >
            All Cases ({cases.length})
          </button>

          <button
            type="button"
            className="btn btn-ghost flex items-center gap-2"
            onClick={() => setActiveTab('PENDING_REPORTS')}
            style={{
              borderRadius: 0,
              borderBottom: activeTab === 'PENDING_REPORTS' ? '3px solid var(--accent)' : '3px solid transparent',
              color: activeTab === 'PENDING_REPORTS' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: 700,
              padding: '0.65rem 1.25rem',
            }}
          >
            <AlertTriangle size={16} />
            Incoming Pet Owner Reports ({pendingReports.length})
            {pendingReports.length > 0 && (
              <span className="badge badge-danger" style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem' }}>
                Action Required
              </span>
            )}
          </button>
        </div>

        {activeTab === 'ALL' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-muted">Filter Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Reported">Reported (Pending Review)</option>
              <option value="Intake">Intake Assessment</option>
              <option value="InTreatment">In Treatment</option>
              <option value="InFoster">In Foster</option>
              <option value="ReadyForAdoption">Ready For Adoption</option>
              <option value="Adopted">Adopted</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'PENDING_REPORTS' && pendingReports.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(231, 111, 81, 0.08)',
            border: '1.5px solid rgba(231, 111, 81, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={20} color="var(--accent)" />
            <h4 style={{ fontWeight: 800, color: 'var(--accent)' }}>
              {pendingReports.length} Animal(s) Reported by Pet Owners Awaiting Admission
            </h4>
          </div>
          <p className="text-xs text-muted">
            Review incoming sighting locations, severity, and field notes below. Click{' '}
            <strong>"Accept & Add to Rescued List"</strong> to admit them into the clinical intake assessment queue and automatically notify the pet owner.
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search cases by name, case number, location, breed, or reporter..."
        emptyMessage={
          activeTab === 'PENDING_REPORTS'
            ? 'No pending animal rescue reports at this time. All reports have been received!'
            : 'No rescue cases found matching filters.'
        }
      />

      <PublishListingModal
        isOpen={isListingModalOpen}
        onClose={() => {
          setIsListingModalOpen(false);
          setSelectedCaseForListing(null);
        }}
        rescueCase={selectedCaseForListing}
        onSuccess={() => {
          fetchCases();
        }}
      />

      {/* Quick Edit Modal */}
      {editingCase && (
        <Modal
          isOpen={Boolean(editingCase)}
          onClose={() => setEditingCase(null)}
          title={`Edit Intake Information – ${editingCase.caseNumber}`}
        >
          <form onSubmit={handleSaveQuickEdit}>
            <div className="form-group">
              <label className="form-label">Temporary Name <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editFormData.temporaryName}
                onChange={(e) => setEditFormData({ ...editFormData, temporaryName: e.target.value })}
                required
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Species <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.species}
                  onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value })}
                  placeholder="e.g. Dog, Cat"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Breed / Mix</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.breed}
                  onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                  placeholder="e.g. Mixed Breed / Stray"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Rescue Location <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editFormData.rescueLocation}
                onChange={(e) => setEditFormData({ ...editFormData, rescueLocation: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Condition Severity</label>
              <select
                className="form-select"
                value={editFormData.conditionSeverity}
                onChange={(e) => setEditFormData({ ...editFormData, conditionSeverity: e.target.value })}
              >
                <option value="Low">Low (Healthy / Minor Scratches)</option>
                <option value="Moderate">Moderate (Dehydrated / Malnourished)</option>
                <option value="High">High (Infection / Fracture)</option>
                <option value="Critical">Critical (Immediate Trauma Triage)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Description / Field Assessment</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
            </div>
            <div className="modal-actions flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setEditingCase(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Case Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Archive Case Confirmation Modal */}
      {caseToDelete && (
        <Modal
          isOpen={Boolean(caseToDelete)}
          onClose={() => setCaseToDelete(null)}
          title="Archive / Remove Rescue Case"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle size={28} />
              <div>
                <h4 className="text-base font-bold text-main">Confirm Rescue Record Removal</h4>
                <p className="text-xs text-muted">
                  Are you sure you want to remove rescue record <strong>{caseToDelete.caseNumber}</strong> ({caseToDelete.temporaryName})?
                  All associated medical logs and intake photographs will be archived.
                </p>
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setCaseToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteCase} disabled={isDeleting}>
                <Trash2 size={16} /> {isDeleting ? 'Archiving...' : 'Archive Case'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
