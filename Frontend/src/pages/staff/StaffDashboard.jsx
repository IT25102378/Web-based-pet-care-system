import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentApi } from '../../api/appointmentApi';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
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
    <div>
      <PageHeader
        eyebrow="Front Desk & Triage"
        icon={Activity}
        title="Staff Operations"
        subtitle="Manage live patient check-ins, walk-in emergency triage, and consultation room flow."
        actions={
          <div className="flex items-center gap-3">
            <Link to="/staff/walk-in" className="btn btn-primary">
              <UserPlus size={16} /> Walk-in Registration
            </Link>
            <Link to="/staff/inventory" className="btn btn-outline">
              <Package size={16} /> Inventory
            </Link>
            <Link to="/staff/queue" className="btn btn-secondary">
              <Clock size={16} /> Patient Queue
            </Link>
          </div>
        }
      />

      {/* Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="In Waiting Lobby"
          value={checkedInCount}
          icon={Clock}
          iconBg="var(--status-warning-bg)"
          iconColor="var(--status-warning)"
          trend="Checked-in patients"
        />
        <StatCard
          label="In Exam Rooms"
          value={inRoomCount}
          icon={Stethoscope}
          iconBg="var(--status-info-bg)"
          iconColor="var(--status-info)"
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
          iconBg="var(--primary-subtle)"
          iconColor="var(--primary)"
          trend="Capacity 94%"
        />
      </div>

      {/* Live Queue Table Preview */}
      <Card
        title="Live Front-Desk Appointment Queue"
        subtitle="Real-time patient flow & triage indicators"
        icon={Clock}
        actions={
          <Link to="/staff/queue" className="text-xs font-bold text-primary flex items-center gap-1">
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
                  <td className="font-bold font-mono text-primary" style={{ fontSize: '0.95rem' }}>
                    {appt.tokenNumber}
                  </td>
                  <td className="font-bold text-main">{appt.petName}</td>
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
