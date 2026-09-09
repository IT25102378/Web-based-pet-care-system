import React, { useState, useEffect } from 'react';
import { careServiceApi } from '../../api/careServiceApi';
import { rescueApi } from '../../api/rescueApi';
import { RescueCaseStatus, ServiceStatus } from '../../types';
import { mockStore } from '../../data/mockStore';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Scissors, Check, Clock, User, Phone, CheckCircle2 } from 'lucide-react';

export const ServiceStatusPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    const list = await careServiceApi.getServiceLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleUpdate = async (logId, status) => {
    try {
      await careServiceApi.updateServiceStatus(logId, status);
      showToast('Status Updated', `Patient moved to ${status}`, 'success');
      loadLogs();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleReturnRescue = async (log) => {
    try {
      await careServiceApi.updateServiceStatus(log.serviceLogId, ServiceStatus.COMPLETED);
      if (log.caseId) {
        const rescueCase = await rescueApi.getRescueCaseById(log.caseId);
        if (rescueCase && rescueCase.status === RescueCaseStatus.READY_FOR_FOSTER) {
          await rescueApi.updateRescueCase(log.caseId, { status: RescueCaseStatus.IN_FOSTER });
          await rescueApi.addProgressLog(log.caseId, {
            title: 'Pet care/rehabilitation completed. Rescue case returned to Rescue Officer.',
            logType: 'Behavioral',
            notes: `Care service (${log.serviceType}) completed by ${currentUser?.fullName || 'Pet Care Provider'}. Returned to rescue oversight.`,
            loggedBy: currentUser?.fullName || 'Dilshan Bandara (Pet Care Provider)',
          });

          // Dispatch notification to Rescue Officer
          mockStore.insertItem('notifications', {
            notificationId: `NTF-${Date.now()}`,
            userId: 'USR-006',
            type: 'Rescue',
            title: 'Rescue Animal Returned from Care Provider',
            message: `${log.petName} care session completed. Returned to rescue oversight in status In Foster Care.`,
            isRead: false,
            link: `/rescue/cases/${log.caseId}`,
            createdAt: new Date().toISOString(),
          });
        }
      }
      showToast('Returned to Rescue', `${log.petName} care marked complete and returned to Rescue Officer.`, 'success');
      loadLogs();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">LIVE SERVICE TRACKER</span>
          <h2>Update Care & Grooming Status</h2>
          <p className="text-sm text-muted">
            Transition patients through service milestones from Checked-In to In Progress, Ready for Pickup, and Completed.
          </p>
        </div>
      </div>

      <div className="grid-3">
        {logs.map((log) => (
          <div key={log.serviceLogId} className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold font-mono text-xs text-primary">{log.serviceLogId}</span>
              <StatusBadge status={log.status} />
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{log.petName}</h3>
            <p className="text-xs text-primary font-semibold mb-3">{log.serviceType}</p>

            <div className="text-xs text-muted mb-4" style={{ backgroundColor: 'var(--bg-subtle)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
              <div>Owner: <strong>{log.ownerName}</strong></div>
              <div>Intake: {log.intakeCondition}</div>
            </div>

            <h4 className="text-xs font-bold uppercase text-muted tracking-wider mb-2">Advance Service Phase:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'CheckedIn' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log.serviceLogId, ServiceStatus.CHECKED_IN)}
              >
                Checked-In
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'InProgress' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log.serviceLogId, ServiceStatus.IN_PROGRESS)}
              >
                In Progress
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'ReadyForPickup' ? 'btn-warning' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log.serviceLogId, ServiceStatus.READY_FOR_PICKUP)}
              >
                Ready Pickup
              </button>
              <button
                type="button"
                className={`btn btn-sm ${log.status === 'Completed' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
                onClick={() => handleUpdate(log.serviceLogId, ServiceStatus.COMPLETED)}
              >
                Completed
              </button>
            </div>

            {log.caseId && (
              <button
                type="button"
                className="btn btn-sm btn-warning"
                style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem', justifyContent: 'center' }}
                onClick={() => handleReturnRescue(log)}
              >
                <CheckCircle2 size={13} /> Complete & Return to Rescue
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
