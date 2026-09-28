import React from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Heart,
  Calendar,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';

export const PerformanceReportsPage = () => {
  const revenueStreams = [
    { label: 'Veterinary Consultations & Triage', amount: 'Rs. 6,100,000', pct: '46%', color: 'var(--primary)' },
    { label: 'Specialist Surgery & Diagnostic Imaging', amount: 'Rs. 3,450,000', pct: '26%', color: '#0EA5E9' },
    { label: 'Pharmacy & Pharmaceutical Dispensing', amount: 'Rs. 2,400,000', pct: '18%', color: '#F59E0B' },
    { label: 'Wellness Packages & Grooming Memberships', amount: 'Rs. 1,300,000', pct: '10%', color: 'var(--accent)' },
  ];

  const monthlyAdoptions = [
    { month: 'March', count: 18, rate: '88%' },
    { month: 'April', count: 24, rate: '92%' },
    { month: 'May', count: 29, rate: '95%' },
    { month: 'June', count: 32, rate: '94%' },
    { month: 'July', count: 38, rate: '97%' },
    { month: 'August', count: 42, rate: '99%' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">CLINICAL INTELLIGENCE</span>
          <h2>Clinic Performance & Operational Analytics</h2>
          <p className="text-sm text-muted">
            Executive overview of hospital revenue distributions, patient volume trends, and shelter adoption outcomes.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid-4 mb-8">
        <StatCard
          label="Gross Hospital Revenue"
          value="Rs. 13,250,000"
          icon={TrendingUp}
          trend="+14.2% YoY"
          trendDirection="up"
        />
        <StatCard
          label="Adoption Conversion"
          value="96.4%"
          icon={Heart}
          iconBg="rgba(231, 111, 81, 0.15)"
          iconColor="var(--accent)"
          trend="+4.1% vs Q2"
          trendDirection="up"
        />
        <StatCard
          label="Patient Visits / Month"
          value="348"
          icon={Calendar}
          iconBg="rgba(14, 165, 233, 0.15)"
          iconColor="#0EA5E9"
          trend="Avg 11.6 visits/day"
        />
        <StatCard
          label="Satisfaction Index"
          value="4.9 / 5"
          icon={Award}
          iconBg="rgba(245, 158, 11, 0.15)"
          iconColor="#F59E0B"
          trend="Based on 140+ reviews"
        />
      </div>

      <div className="grid-2 mb-8">
        {/* Revenue Breakdown */}
        <Card title="Revenue Distribution by Service Stream" icon={TrendingUp}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {revenueStreams.map((stream, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span>{stream.label}</span>
                  <span style={{ color: stream.color }}>{stream.amount} ({stream.pct})</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      backgroundColor: stream.color,
                      width: stream.pct,
                      borderRadius: '9999px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Adoption Trajectory */}
        <Card title="Rescue Shelter Adoption Velocity" icon={Heart}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Placed Companions</th>
                  <th>Retention & Welfare Success</th>
                </tr>
              </thead>
              <tbody>
                {monthlyAdoptions.map((m, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-xs">{m.month} 2026</td>
                    <td className="font-bold text-sm text-primary">{m.count} Pets Rehomed</td>
                    <td>
                      <span className="badge badge-success text-xs">
                        <CheckCircle2 size={12} /> {m.rate} Verified Home Retention
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
