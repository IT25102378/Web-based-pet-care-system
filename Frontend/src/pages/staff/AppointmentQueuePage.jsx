import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  CheckCircle,
  Stethoscope,
  ArrowRight,
  UserCheck,
  Check,
  AlertCircle,
  Filter,
  Eye,
  CheckSquare
} from 'lucide-react';
import { AppointmentDetailsModal } from '../../components/common/AppointmentDetailsModal';

export const AppointmentQueuePage = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApptForView, setSelectedApptForView] = useState(null);

  const loadQueue = async () => {
    try {
      const list = await appointmentApi.getAppointments();
      setAppointments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      await appointmentApi.updateStatus(appointmentId, newStatus);
      showToast('Queue Updated', `Patient status updated to ${newStatus}`, 'success');
      loadQueue();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      await appointmentApi.confirmAppointment(appointmentId);
      showToast('Appointment Confirmed', `Appointment has been confirmed`, 'success');
      loadQueue();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  const columns = [
    {
      header: 'Token #',
      key: 'tokenNumber',
      sortable: true,
      render: (row) => (
        <span className="font-bold font-mono" style={{ color: '#E76F51', fontSize: '1.1rem' }}>
          {row.tokenNumber || 'A-01'}
        </span>
      ),
    },
    {
      header: 'Patient Companion',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm" style={{ color: '#12304A' }}>{row.petName}</div>
          <div className="text-xs text-muted">Owner: {row.ownerName} ({row.ownerPhone})</div>
        </div>
      ),
    },
    {
      header: 'Reason / Triage Symptoms',
      key: 'serviceType',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-main">{row.serviceType}</div>
          <div className="text-xs text-muted mt-1">{row.reason}</div>
          {row.symptoms && (
            <div className="text-xs mt-1 italic" style={{ color: '#E76F51' }}>Observed: {row.symptoms}</div>
          )}
        </div>
      ),
    },
    {
      header: 'Doctor Assigned',
      key: 'vetName',
      render: (row) => <span className="text-xs font-semibold">{row.vetName}</span>,
    },
    {
      header: 'Slot',
      key: 'timeSlot',
      render: (row) => <span className="text-xs font-mono">{row.timeSlot}</span>,
    },
    {
      header: 'Status Indicator',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Queue Progression Actions',
      key: 'actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedApptForView(row)}
            title="View Appointment Details"
            style={{ padding: '0.35rem 0.5rem' }}
          >
            <Eye size={14} />
          </button>

          {row.status === 'Pending' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 600 }}
              onClick={() => handleConfirmAppointment(row.appointmentId)}
              title="Confirm Appointment"
            >
              <CheckSquare size={14} /> Confirm
            </button>
          )}

          {(row.status === 'Scheduled' || row.status === 'Confirmed') && (
            <button
              type="button"
              className="btn btn-warning btn-sm"
              style={{ backgroundColor: '#F4A261', color: '#FFFFFF', fontWeight: 600 }}
              onClick={() => handleUpdateStatus(row.appointmentId, 'CheckedIn')}
              title="Mark Patient Checked-In to Lobby"
            >
              <UserCheck size={14} /> Check-In
            </button>
          )}

          {row.status === 'CheckedIn' && (
            <button
              type="button"
              className="btn btn-info btn-sm"
              style={{ backgroundColor: '#0EA5E9', color: '#FFFFFF', fontWeight: 600 }}
              onClick={() => handleUpdateStatus(row.appointmentId, 'InRoom')}
              title="Call Patient to Exam Room"
            >
              <Stethoscope size={14} /> Send to Room
            </button>
          )}

          {row.status === 'InRoom' && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 600 }}
              onClick={() => handleUpdateStatus(row.appointmentId, 'Completed')}
              title="Mark Consultation Complete"
            >
              <Check size={14} /> Complete
            </button>
          )}

          {row.status === 'Completed' && (
            <span className="text-xs text-muted font-semibold flex items-center gap-1">
              <CheckCircle size={14} color="#10B981" /> Discharged
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            LIVE CLINICAL QUEUE
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Front Desk Appointment Queue</h2>
          <p className="text-sm text-muted">
            Track waiting patients, update lobby check-in tokens, and direct patients into veterinary exam rooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Queue Status Filter:</label>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Patients</option>
            <option value="Pending">Pending Confirmation</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="CheckedIn">Checked-In (Lobby)</option>
            <option value="InRoom">In Exam Room</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredAppointments}
        searchPlaceholder="Search token #, pet name, client, doctor..."
        emptyMessage="No active patients in the queue matching selected filters."
      />

      <AppointmentDetailsModal
        appointment={selectedApptForView}
        onClose={() => setSelectedApptForView(null)}
      />
    </div>
  );
};
