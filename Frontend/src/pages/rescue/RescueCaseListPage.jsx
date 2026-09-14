import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rescueApi } from '../../api/rescueApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PublishListingModal } from '../../components/common/PublishListingModal';
import { FolderOpen, PlusCircle, Eye, Heart, Home, Globe } from 'lucide-react';

export const RescueCaseListPage = () => {
  const [cases, setCases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCaseForListing, setSelectedCaseForListing] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);

  const fetchCases = async () => {
    const list = await rescueApi.getRescueCases();
    setCases(list);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = cases.filter((c) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

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
            style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
          />
          <div>
            <div className="font-bold text-sm text-main">{row.temporaryName}</div>
            <div className="text-xs text-muted">{row.species} • {row.breed}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Intake Date',
      key: 'intakeDate',
      sortable: true,
      render: (row) => <span className="text-xs">{row.intakeDate}</span>,
    },
    {
      header: 'Severity',
      key: 'conditionSeverity',
      render: (row) => (
        <span
          className={`badge ${
            row.conditionSeverity === 'High'
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
      header: 'Adoption Listing',
      key: 'isPublishedForAdoption',
      render: (row) =>
        row.isPublishedForAdoption ? (
          <span className="badge badge-success text-xs">Published</span>
        ) : (
          <span className="badge badge-secondary text-xs">Unpublished</span>
        ),
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
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
          <Link to={`/rescue/cases/${row.caseId}`} className="btn btn-secondary btn-sm">
            <Eye size={14} /> Case Timeline
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-warning mb-1">CASE ROSTER</span>
          <h2>Rescue Cases Repository</h2>
          <p className="text-sm text-muted">
            Search and monitor all active animal intakes, medical logs, foster placements, and finalized adoptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Intake">Intake</option>
            <option value="InTreatment">In Treatment</option>
            <option value="InFoster">In Foster</option>
            <option value="ReadyForAdoption">Ready For Adoption</option>
            <option value="Adopted">Adopted</option>
          </select>

          <Link to="/rescue/register-case" className="btn btn-accent">
            <PlusCircle size={16} /> New Intake
          </Link>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search cases by name, case number, location, breed..."
        emptyMessage="No rescue cases found matching filters."
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
    </div>
  );
};
