import React from 'react';
import { PawPrint, RefreshCw, Ban } from 'lucide-react';
import { Modal } from './Modal';
import { StatusBadge } from './StatusBadge';

export const AppointmentDetailsModal = ({
  appointment,
  onClose,
  isEligibleForAction,
  onReschedule,
  onCancel,
}) => {
  if (!appointment) return null;

  return (
    <Modal
      isOpen={!!appointment}
      onClose={onClose}
      title={`Appointment Details (${appointment.tokenNumber || appointment.appointmentId})`}
      subtitle="Complete record of clinic consultation, patient vitals, and scheduling notes."
      size="md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Status Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
          }}
        >
          <div className="flex items-center gap-2">
            <PawPrint size={18} className="text-primary" />
            <span className="font-bold text-base text-main">{appointment.petName}</span>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Grid Info */}
        <div className="grid-2 gap-3 text-sm">
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span className="text-xs text-muted font-semibold block">Attending Doctor</span>
            <span className="font-medium text-main">{appointment.vetName}</span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span className="text-xs text-muted font-semibold block">Date & Time Slot</span>
            <span className="font-medium text-main">{appointment.appointmentDate} at {appointment.timeSlot}</span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span className="text-xs text-muted font-semibold block">Service Type</span>
            <span className="font-medium text-main">{appointment.serviceType}</span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span className="text-xs text-muted font-semibold block">Owner Contact</span>
            <span className="font-medium text-main">{appointment.ownerName} ({appointment.ownerPhone || 'Registered Phone'})</span>
          </div>
        </div>

        {/* Reason & Symptoms */}
        <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)' }}>
          <span className="text-xs text-muted font-semibold block mb-1">Reason for Visit</span>
          <p className="text-sm text-main font-medium">{appointment.reason}</p>
          {appointment.symptoms && (
            <p className="text-xs text-muted mt-2">
              <strong>Reported Symptoms:</strong> {appointment.symptoms}
            </p>
          )}
        </div>

        {/* Reschedule Notice (if applicable) */}
        {appointment.rescheduledFrom && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--primary-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(42, 140, 130, 0.25)',
              fontSize: '0.825rem',
            }}
          >
            <span className="font-bold text-primary block mb-0.5 flex items-center gap-1">
              <RefreshCw size={13} /> Rescheduled History
            </span>
            <p className="text-xs text-muted">
              Originally booked for <strong>{appointment.rescheduledFrom.date}</strong> at <strong>{appointment.rescheduledFrom.timeSlot}</strong>.
              {appointment.rescheduleReason && ` Reason: ${appointment.rescheduleReason}`}
            </p>
          </div>
        )}

        {/* Cancellation Notice (if applicable) */}
        {appointment.status === 'Cancelled' && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--status-danger-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #FECACA',
              fontSize: '0.825rem',
            }}
          >
            <span className="font-bold text-danger block mb-0.5 flex items-center gap-1">
              <Ban size={13} /> Cancellation Reason
            </span>
            <p className="text-xs text-muted">
              {appointment.cancellationReason || 'Cancelled by Pet Owner.'}
              {appointment.cancelledAt && ` (${new Date(appointment.cancelledAt).toLocaleString()})`}
            </p>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-top" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-2">
            {isEligibleForAction && isEligibleForAction(appointment) && (
              <>
                {onReschedule && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      onClose();
                      onReschedule(appointment);
                    }}
                  >
                    <RefreshCw size={14} /> Reschedule
                  </button>
                )}
                {onCancel && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--status-danger)' }}
                    onClick={() => {
                      onClose();
                      onCancel(appointment);
                    }}
                  >
                    <Ban size={14} /> Cancel Visit
                  </button>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
};
