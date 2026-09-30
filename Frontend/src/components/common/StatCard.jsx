import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  trendDirection = 'up',
  iconBg = 'var(--primary-subtle)',
  iconColor = 'var(--primary)',
  onClick,
}) => {
  return (
    <div
      className="stat-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-icon-box" style={{ backgroundColor: iconBg, color: iconColor }}>
        {Icon && <Icon size={26} />}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {(trend || trendLabel) && (
          <div
            className="stat-trend"
            style={{
              color: trendDirection === 'up' ? 'var(--status-success)' : 'var(--status-danger)',
            }}
          >
            {trendDirection === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trend}</span>
            {trendLabel && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
