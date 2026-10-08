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
  RotateCcw,
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
        <span className="font-bold font-mono text-primary" style={{ fontSize: '1.1rem' }}>
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
          <div className="font-bold text-sm text-main">{row.petName}</div>
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
            <div className="text-xs mt-1 italic" style={{ color: 'var(--accent)' }}>Observed: {row.symptoms}</div>
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
                style={{ backgroundColor: 'var(--status-warning)', color: '#FFFFFF', fontWeight: 600 }}
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
              style={{ backgroundcolor: 'var(--primary)', color: '#FFFFFF', fontWeight: 600 }}
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
      {/* Apple-grade Header & Velocity HUD */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="apple-eyebrow mb-1">CLINICAL DISPATCH & FRONT DESK</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em', margin: '4px 0' }}>
            Front Desk Appointment Queue
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Lobby check-in tokens, exam room assignments, real-time wait velocities, and patient flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="liquid-glass-pill">
            <span className="telemetry-pulse-dot" style={{ backgroundColor: '#10B981' }}></span>
            <span>Lobby Velocity: <strong>14 min avg</strong></span>
          </div>
          <select
            className="form-select"
            style={{
              width: 'auto',
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 1rem',
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#FFFFFF',
              fontWeight: 500,
              fontSize: '0.85rem'
            }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Patients ({appointments.length})</option>
            <option value="Pending">Pending Confirmation</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Scheduled">Scheduled</option>
            <option value="CheckedIn">Checked-In (Lobby)</option>
            <option value="InRoom">In Exam Room</option>
            <option value="Completed">Completed / Discharged</option>
            <option value="NoShow">No-Show</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {statusFilter !== 'ALL' && (
            <button
              type="button"
              className="apple-pill-btn-clear"
              onClick={() => setStatusFilter('ALL')}
              title="Reset queue filter to all patients"
            >
              <RotateCcw size={13} /> Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Signature Apple Element: Front-Desk Triage Board & Token Flow Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Token Flow Pass (Apple Wallet style) */}
        <div className="apple-triage-pass apple-liquid-glass-dark lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4" style={{ borderBottom: '1px dashed rgba(255,255,255,0.2)' }}>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700 }}>
                CLINIC QUEUE PASS
              </span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px' }}>
                PRIORITY ACCESS
              </span>
            </div>
            <div className="text-xs opacity-75 font-mono">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>

          {(() => {
            const activePatient = appointments.find(a => a.status === 'CheckedIn' || a.status === 'InRoom') || appointments[0];
            if (!activePatient) {
              return (
                <div className="py-6 text-center text-sm opacity-80">
                  No patients currently checked in or awaiting consultation.
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <div className="text-xs opacity-75 uppercase tracking-wider mb-1">Now Calling Token</div>
                  <div className="text-4xl font-extrabold font-mono tracking-tight" style={{ color: '#FCD34D' }}>
                    {activePatient.tokenNumber || 'T-01'}
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    Slot: {activePatient.timeSlot || 'Immediate'}
                  </div>
                </div>

                <div>
                  <div className="text-xs opacity-75 uppercase tracking-wider mb-1">Companion & Owner</div>
                  <div className="text-lg font-bold text-white">
                    {activePatient.petName}
                  </div>
                  <div className="text-xs opacity-80">
                    {activePatient.ownerName} • {activePatient.serviceType || 'Consultation'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#E2E8F0' }}>
                    Assigned: Dr. {activePatient.vetName || 'On Duty'}
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-end">
                  <div className="text-xs opacity-75 uppercase tracking-wider">Status & Dispatch</div>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', alignSelf: 'flex-start' }}>
                    {activePatient.status === 'CheckedIn' ? 'Waiting in Lobby' : activePatient.status}
                  </span>
                  {activePatient.status === 'CheckedIn' && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: '#FFFFFF', color: '#0E8376', fontWeight: 700, borderRadius: 'var(--radius-full)', marginTop: '4px' }}
                      onClick={() => handleUpdateStatus(activePatient.appointmentId, 'InRoom')}
                    >
                      <Stethoscope size={14} /> Direct to Room
                    </button>
                  )}
                  {activePatient.status === 'InRoom' && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: '#10B981', color: '#FFFFFF', fontWeight: 700, borderRadius: 'var(--radius-full)', marginTop: '4px' }}
                      onClick={() => handleUpdateStatus(activePatient.appointmentId, 'Completed')}
                    >
                      <Check size={14} /> Discharge Companion
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Real-time Triage Summary Metrics */}
        <div className="apple-liquid-glass p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Lobby Overview
            </span>
            <span className="badge badge-primary text-xs" style={{ background: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className="p-3" style={{ background: '#F5F5F7', borderRadius: '16px' }}>
              <div className="text-2xl font-bold" style={{ color: '#0E8376' }}>
                {appointments.filter(a => a.status === 'CheckedIn').length}
              </div>
              <div className="text-xs font-semibold text-muted">In Lobby</div>
            </div>
            <div className="p-3" style={{ background: '#F5F5F7', borderRadius: '16px' }}>
              <div className="text-2xl font-bold" style={{ color: '#0EA5E9' }}>
                {appointments.filter(a => a.status === 'InRoom').length}
              </div>
              <div className="text-xs font-semibold text-muted">In Exam</div>
            </div>
            <div className="p-3" style={{ background: '#F5F5F7', borderRadius: '16px' }}>
              <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
                {appointments.filter(a => a.status === 'Pending' || a.status === 'Scheduled').length}
              </div>
              <div className="text-xs font-semibold text-muted">Upcoming</div>
            </div>
            <div className="p-3" style={{ background: '#F5F5F7', borderRadius: '16px' }}>
              <div className="text-2xl font-bold" style={{ color: '#10B981' }}>
                {appointments.filter(a => a.status === 'Completed').length}
              </div>
              <div className="text-xs font-semibold text-muted">Discharged</div>
            </div>
          </div>

          <div className="text-xs text-muted pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            Tokens update automatically upon owner mobile check-in.
          </div>
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
