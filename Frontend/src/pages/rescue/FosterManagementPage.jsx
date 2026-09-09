import React, { useState, useEffect } from 'react';
import { rescueApi } from '../../api/rescueApi';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { Home, User, Phone, MapPin, Star, Plus } from 'lucide-react';

export const FosterManagementPage = () => {
  const [fosters, setFosters] = useState([]);

  useEffect(() => {
    const fetchFosters = async () => {
      const list = await rescueApi.getFosterRecords();
      setFosters(list);
    };
    fetchFosters();
  }, []);

  const columns = [
    {
      header: 'Foster Parent',
      key: 'fullName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.fullName}</div>
          <div className="text-xs text-muted">{row.email} • {row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Housing & Yard Environment',
      key: 'homeType',
      render: (row) => <span className="text-xs text-main">{row.homeType}</span>,
    },
    {
      header: 'Address',
      key: 'address',
      render: (row) => <span className="text-xs text-muted">{row.address}</span>,
    },
    {
      header: 'Capacity & Active',
      key: 'activePlacements',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="badge badge-primary text-xs">
            {row.activePlacements} / {row.maxCapacity} Occupied
          </span>
        </div>
      ),
    },
    {
      header: 'Rating',
      key: 'rating',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#F59E0B' }}>
          <Star size={14} fill="#F59E0B" /> {row.rating} / 5
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-warning mb-1">FOSTER ROSTER</span>
          <h2>Foster Parent Management</h2>
          <p className="text-sm text-muted">
            Directory of verified foster volunteer homes, capacity limits, and current rehabilitation assignments.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={fosters}
        searchPlaceholder="Search foster parents by name, home type, phone..."
        emptyMessage="No foster parent records found."
      />
    </div>
  );
};
