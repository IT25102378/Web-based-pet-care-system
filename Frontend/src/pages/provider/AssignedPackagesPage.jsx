import React, { useState, useEffect } from 'react';
import { careServiceApi } from '../../api/careServiceApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { Layers, Check, Sparkles, User, Calendar } from 'lucide-react';

export const AssignedPackagesPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const list = await careServiceApi.getPackageBookings();
      setBookings(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRedeem = async (booking) => {
    if (booking.remainingSessions <= 0) {
      showToast('Completed', 'All sessions for this package have already been redeemed.', 'info');
      return;
    }

    try {
      await careServiceApi.redeemPackageSession(booking.bookingId);
      showToast('Session Logged', `Redeemed 1 session for ${booking.petName} (${booking.packageName})`, 'success');
      loadBookings();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Booking ID',
      key: 'bookingId',
      sortable: true,
      render: (row) => <span className="font-mono font-bold text-xs text-primary">{row.bookingId}</span>,
    },
    {
      header: 'Enrolled Package',
      key: 'packageName',
      sortable: true,
      render: (row) => (
        <div className="font-bold text-sm text-main">
          {row.packageName}
        </div>
      ),
    },
    {
      header: 'Patient Companion & Owner',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-xs text-main">{row.petName}</div>
          <div className="text-xs text-muted">{row.ownerName}</div>
        </div>
      ),
    },
    {
      header: 'Sessions Balance',
      key: 'remainingSessions',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-primary">{row.completedSessions} completed</span>
          <span className="text-muted"> / {row.remainingSessions} remaining</span>
        </div>
      ),
    },
    {
      header: 'Valid Expiry',
      key: 'expiryDate',
      render: (row) => <span className="text-xs text-muted">{row.expiryDate}</span>,
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Session Action',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => handleRedeem(row)}
          disabled={row.remainingSessions <= 0}
        >
          <Check size={14} /> Log Completed Session
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">PACKAGE FULFILLMENT</span>
          <h2>Assigned Wellness & Grooming Packages</h2>
          <p className="text-sm text-muted">
            Track active client prepaid packages, log redeemed care sessions, and monitor membership balances.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        searchPlaceholder="Search packages by pet, owner, name..."
        emptyMessage="No active package enrollments."
      />
    </div>
  );
};
