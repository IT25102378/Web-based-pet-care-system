import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../../api/appointmentApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
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
  CheckSquare,
  UserX,
  XCircle,
} from 'lucide-react';
import { AppointmentDetailsModal } from '../../components/common/AppointmentDetailsModal';

export const AppointmentQueuePage = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedApptForView, setSelectedApptForView] = useState(null);

  // Cancellation Modal
  const [cancelModalAppt, setCancelModalAppt] = useState(null);
  const [cancelReason, setCancelReason] = useState('Patient did not show up / requested cancellation');

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

  const handleMarkNoShow = async (appointmentId) => {
    try {
      await appointmentApi.updateStatus(appointmentId, 'NoShow');
      showToast('Patient Marked No-Show', 'Appointment marked as missed/no-show.', 'info');
      loadQueue();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalAppt) return;
    try {
      await appointmentApi.cancelAppointment(cancelModalAppt.appointmentId, {
        cancellationReason: cancelReason || 'Cancelled at front desk',
      });
      showToast('Appointment Cancelled', `Appointment #${cancelModalAppt.appointmentId} has been cancelled.`, 'info');
      setCancelModalAppt(null);
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
          <div className="text-xs text-muted">
            Owner: {row.ownerName} {row.ownerPhone ? `(${row.ownerPhone})` : ''}
          </div>
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
        <div className="flex items-center gap-1 flex-wrap">
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
            <>
              <button
                type="button"
                className="btn btn-warning btn-sm"
                style={{ backgroundColor: '#F4A261', color: '#FFFFFF', fontWeight: 600 }}
                onClick={() => handleUpdateStatus(row.appointmentId, 'CheckedIn')}
                title="Mark Patient Checked-In to Lobby"
              >
                <UserCheck size={14} /> Check-In
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-muted"
                onClick={() => handleMarkNoShow(row.appointmentId)}
                title="Mark Patient No-Show"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <UserX size={13} /> No-Show
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => setCancelModalAppt(row)}
                title="Cancel Appointment"
                style={{ color: '#EF4444', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
              >
                <XCircle size={13} /> Cancel
              </button>
            </>
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

          {row.status === 'NoShow' && (
            <span className="badge badge-secondary text-xs">Missed Visit</span>
          )}

          {row.status === 'Cancelled' && (
            <span className="badge badge-secondary text-xs">Cancelled</span>
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
            Track waiting patients, update lobby check-in tokens, manage no-shows, and direct patients into veterinary exam rooms.
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
            <option value="Completed">Completed / Discharged</option>
            <option value="NoShow">No-Show</option>
            <option value="Cancelled">Cancelled</option>
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

      {/* Cancellation Dialog Modal */}
      {cancelModalAppt && (
        <Modal
          isOpen={!!cancelModalAppt}
          onClose={() => setCancelModalAppt(null)}
          title="Cancel Appointment"
          subtitle={`Cancelling visit for ${cancelModalAppt.petName} (Client: ${cancelModalAppt.ownerName})`}
          size="sm"
        >
          <form onSubmit={handleCancelSubmit}>
            <div className="form-group">
              <label className="form-label">Cancellation Reason <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setCancelModalAppt(null)}>
                Keep Appointment
              </button>
              <button type="submit" className="btn btn-danger" style={{ backgroundColor: '#EF4444', color: '#FFFFFF' }}>
                <XCircle size={16} /> Confirm Cancellation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
