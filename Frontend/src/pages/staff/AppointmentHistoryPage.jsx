import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AppointmentDetailsModal } from '../../components/common/AppointmentDetailsModal';
import { History, Calendar, Download, Filter, Eye } from 'lucide-react';

export const AppointmentHistoryPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [vetFilter, setVetFilter] = useState('');
  const [petFilter, setPetFilter] = useState('');
  const [selectedApptForView, setSelectedApptForView] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const list = await appointmentApi.getAppointments();
      setAppointments(list);
    };
    fetchHistory();
  }, []);

  const filtered = appointments.filter((a) => {
    let match = true;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) match = false;
    if (dateFilter && a.appointmentDate !== dateFilter) match = false;
    if (vetFilter && !a.vetName?.toLowerCase().includes(vetFilter.toLowerCase())) match = false;
    if (petFilter && !a.petName?.toLowerCase().includes(petFilter.toLowerCase())) match = false;
    return match;
  });

  const columns = [
    {
      header: 'Appt Ref',
      key: 'appointmentId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold" style={{ color: '#E76F51' }}>{row.appointmentId}</span>,
    },
    {
      header: 'Date & Time',
      key: 'appointmentDate',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-main" style={{ color: '#12304A' }}>{row.appointmentDate}</div>
          <div className="text-muted">{row.timeSlot}</div>
        </div>
      ),
    },
    {
      header: 'Patient Companion',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm" style={{ color: '#12304A' }}>{row.petName}</div>
          <div className="text-xs text-muted">{row.ownerName}</div>
        </div>
      ),
    },
    {
      header: 'Service Rendered',
      key: 'serviceType',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-main">{row.serviceType}</span>
          <div className="text-xs text-muted">{row.reason}</div>
        </div>
      ),
    },
    {
      header: 'Doctor',
      key: 'vetName',
      render: (row) => <span className="text-xs font-medium">{row.vetName}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setSelectedApptForView(row)}
          title="View Appointment Details"
          style={{ padding: '0.35rem 0.5rem' }}
        >
          <Eye size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            ARCHIVES & AUDIT
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Appointment History Archive</h2>
          <p className="text-sm text-muted">Complete historical log of all consultations, surgery admissions, and discharges.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted">Date:</label>
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: 'auto' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted">Vet:</label>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '120px' }}
              placeholder="Any Vet"
              value={vetFilter}
              onChange={(e) => setVetFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted">Pet:</label>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ width: '120px' }}
              placeholder="Any Pet"
              value={petFilter}
              onChange={(e) => setPetFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted">Status:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="CheckedIn">Checked In</option>
              <option value="Cancelled">Cancelled</option>
              <option value="NoShow">No Show</option>
            </select>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        searchPlaceholder="Search history by reference, pet, owner, doctor..."
        emptyMessage="No historical appointment records found matching filters."
      />

      <AppointmentDetailsModal
        appointment={selectedApptForView}
        onClose={() => setSelectedApptForView(null)}
      />
    </div>
  );
};
