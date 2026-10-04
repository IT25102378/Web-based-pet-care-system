import React, { useState, useEffect } from 'react';
import { adoptionApi } from '../../api/adoptionApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { History, Heart, Calendar, CheckCircle } from 'lucide-react';

export const AdoptionHistoryPage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const list = await adoptionApi.getAdoptionRecords();
      setRecords(list);
    };
    fetchRecords();
  }, []);

  const columns = [
    {
      header: 'Record ID',
      key: 'adoptionRecordId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.adoptionRecordId}</span>,
    },
    {
      header: 'Adopted Pet',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2 font-bold text-sm text-main">
          <Heart size={14} className="text-accent" /> {row.petName} ({row.species})
        </div>
      ),
    },
    {
      header: 'Forever Adopter',
      key: 'adopterName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.adopterName}</div>
          <div className="text-xs text-muted">{row.adopterPhone}</div>
        </div>
      ),
    },
    {
      header: 'Finalized Date',
      key: 'finalizedDate',
      sortable: true,
      render: (row) => <span className="text-xs">{row.finalizedDate}</span>,
    },
    {
      header: 'Adoption Fee',
      key: 'adoptionFee',
      render: (row) => <span className="text-xs font-bold text-main">Rs. {Number(row.adoptionFee).toLocaleString()}</span>,
    },
    {
      header: 'Post-Adoption Welfare Checkup',
      key: 'checkupStatus',
      render: (row) => (
        <div>
          <span className="badge badge-success text-xs">
            <CheckCircle size={12} /> {row.checkupStatus}
          </span>
          <div className="text-xs text-muted mt-1">Due: {row.postAdoptionCheckupDate}</div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-warning mb-1">FINALIZED ADOPTIONS</span>
          <h2>Adoption History & Post-Placement Care</h2>
          <p className="text-sm text-muted">
            Archive of successfully completed forever-home placements and post-adoption 30-day wellness audits.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        searchPlaceholder="Search adoption records by pet, adopter, record ID..."
        emptyMessage="No finalized adoption records found."
      />
    </div>
  );
};
