import React from 'react';

const STATUS_CONFIG = {
  // User Statuses
  Active: { label: 'Active', class: 'badge-success' },
  PendingApproval: { label: 'Pending Approval', class: 'badge-warning' },
  Rejected: { label: 'Rejected', class: 'badge-danger' },
  Suspended: { label: 'Suspended', class: 'badge-danger' },

  // Rescue Case Statuses
  Intake: { label: 'Intake Assessment', class: 'badge-warning' },
  InTreatment: { label: 'In Medical Treatment', class: 'badge-info' },
  ReadyForFoster: { label: 'Ready for Foster', class: 'badge-purple' },
  InFoster: { label: 'In Foster Care', class: 'badge-info' },
  ReadyForAdoption: { label: 'Ready for Adoption', class: 'badge-success' },
  Adopted: { label: 'Adopted (Forever Home)', class: 'badge-primary' },
  Closed: { label: 'Closed', class: 'badge-secondary' },

  // Adoption Application Statuses
  Submitted: { label: 'Submitted', class: 'badge-info' },
  UnderReview: { label: 'Under Review', class: 'badge-warning' },
  Approved: { label: 'Approved', class: 'badge-success' },

  // Appointment Statuses (shared Cancelled/Rejected with adoption)
  Scheduled: { label: 'Scheduled', class: 'badge-primary' },
  Confirmed: { label: 'Confirmed', class: 'badge-primary' },
  Pending: { label: 'Pending', class: 'badge-warning' },
  CheckedIn: { label: 'Checked In (Lobby)', class: 'badge-warning' },
  InRoom: { label: 'In Exam Room', class: 'badge-info' },
  Completed: { label: 'Completed', class: 'badge-success' },
  Cancelled: { label: 'Cancelled', class: 'badge-secondary' },
  NoShow: { label: 'No Show', class: 'badge-danger' },

  // Service Statuses
  InProgress: { label: 'In Progress', class: 'badge-info' },
  ReadyForPickup: { label: 'Ready for Pickup', class: 'badge-warning' },

  // Stock Statuses
  InStock: { label: 'In Stock', class: 'badge-success' },
  LowStock: { label: 'Low Stock Alert', class: 'badge-warning' },
  OutOfStock: { label: 'Out of Stock', class: 'badge-danger' },
  Expired: { label: 'Expired', class: 'badge-danger' },

  // Vaccinations
  'Up-to-Date': { label: 'Up-to-Date', class: 'badge-success' },
  'Due Soon': { label: 'Due Soon', class: 'badge-warning' },
  Overdue: { label: 'Overdue', class: 'badge-danger' },
};

export const StatusBadge = ({ status, customLabel = null }) => {
  const config = STATUS_CONFIG[status] || { label: status || 'Unknown', class: 'badge-secondary' };
  const label = customLabel || config.label;

  return (
    <span className={`badge ${config.class}`}>
      <span className="badge-dot" />
      {label}
    </span>
  );
};
