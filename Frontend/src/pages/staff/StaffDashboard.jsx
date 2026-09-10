import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import {
  Clock,
  UserPlus,
  Calendar,
  CheckCircle2,
  Users,
  Activity,
  ArrowRight,
  Stethoscope,
  AlertTriangle,
  UserCheck,
  Package,
} from 'lucide-react';

export const StaffDashboard = () => {
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const list = await appointmentApi.getAppointments();
        setTodayAppointments(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadQueue();
  }, []);

  const scheduledCount = todayAppointments.filter((a) => a.status === 'Scheduled').length;
  const checkedInCount = todayAppointments.filter((a) => a.status === 'CheckedIn').length;
  const inRoomCount = todayAppointments.filter((a) => a.status === 'InRoom').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'Completed').length;

  return (
    <div style={{ color: '#1F2937' }}>
      {/* Header Banner */}
      <div
        style={{
          backgroundColor: '#FFF8F3',
          border: '1px solid #FEE2E2',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(231, 111, 81, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            className="badge mb-1"
            style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem' }}
          >
            FRONT DESK & TRIAGE
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>
            Clinic Staff Operations Hub
          </h2>
          <p className="text-sm mt-1" style={{ color: '#4B5563' }}>
            Manage live patient check-ins, walk-in emergency triage, and veterinary consultation room flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/staff/walk-in"
            className="btn"
            style={{
              backgroundColor: '#E76F51',
              color: '#FFFFFF',
              fontWeight: 700,
              boxShadow: '0 4px 10px rgba(231, 111, 81, 0.25)',
            }}
          >
            <UserPlus size={16} /> Fast Walk-in Registration
          </Link>
          <Link
            to="/staff/inventory"
            className="btn"
            style={{ backgroundColor: '#12304A', color: '#FFFFFF', fontWeight: 600 }}
          >
            <Package size={16} /> View Inventory
          </Link>
          <Link
            to="/staff/queue"
            className="btn btn-secondary"
          >
            <Clock size={16} /> Patient Queue
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="In Waiting Lobby"
          value={checkedInCount}
          icon={Clock}
          iconBg="rgba(244, 162, 97, 0.15)"
          iconColor="#F4A261"
          trend="Checked-in patients"
        />
        <StatCard
          label="In Exam Rooms"
          value={inRoomCount}
          icon={Stethoscope}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0EA5E9"
          trend="Active consults"
        />
        <StatCard
          label="Completed Today"
          value={completedCount}
          icon={CheckCircle2}
          trend="Discharged"
          trendDirection="up"
        />
        <StatCard
          label="Total Scheduled"
          value={todayAppointments.length}
          icon={Calendar}
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="#E76F51"
          trend="Capacity 94%"
        />
      </div>

      {/* Live Queue Table Preview */}
      <Card
        title="Live Front-Desk Appointment Queue"
        subtitle="Real-time patient flow & triage indicators"
        icon={Clock}
        actions={
          <Link to="/staff/queue" className="text-xs font-bold flex items-center gap-1" style={{ color: '#E76F51' }}>
            Open Full Queue Manager <ArrowRight size={14} />
          </Link>
        }
      >
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Owner / Client</th>
                <th>Service / Reason</th>
                <th>Doctor</th>
                <th>Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.slice(0, 5).map((appt) => (
                <tr key={appt.appointmentId}>
                  <td className="font-bold font-mono" style={{ color: '#E76F51', fontSize: '1rem' }}>
                    {appt.tokenNumber}
                  </td>
                  <td className="font-bold" style={{ color: '#12304A' }}>{appt.petName}</td>
                  <td className="text-xs">{appt.ownerName} ({appt.ownerPhone})</td>
                  <td className="text-xs">{appt.serviceType}</td>
                  <td className="text-xs font-semibold">{appt.vetName}</td>
                  <td className="text-xs font-mono">{appt.timeSlot}</td>
                  <td><StatusBadge status={appt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
