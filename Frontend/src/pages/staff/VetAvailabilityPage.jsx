import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { appointmentApi } from '../../api/appointmentApi';
import { Calendar, Clock, Stethoscope, User, Search, Eye } from 'lucide-react';
import { AppointmentDetailsModal } from '../../components/common/AppointmentDetailsModal';

export const VetAvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedVet, setSelectedVet] = useState('Dr. Sachini Wijesinghe, BVSc');
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApptForView, setSelectedApptForView] = useState(null);

  const vets = [
    { name: 'Dr. Sachini Wijesinghe, BVSc', title: 'Small Animal Surgery' },
    { name: 'Dr. Michael Chen, DVM', title: 'Internal Medicine' },
    { name: 'Dr. Amanda Ramirez, DVM', title: 'Feline & Dermatology' },
  ];

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const [appointments, slots] = await Promise.all([
        appointmentApi.getAppointments(),
        appointmentApi.getAvailableSlots(selectedVet, selectedDate)
      ]);

      const todaysAppointments = appointments.filter(a => a.appointmentDate === selectedDate && a.vetName === selectedVet);

      const mappedSchedule = slots.map(slot => {
        const bookedAppt = todaysAppointments.find(a => a.timeSlot === slot.timeSlot && a.status !== 'Cancelled' && a.status !== 'NoShow');
        return {
          timeSlot: slot.timeSlot,
          isAvailable: slot.isAvailable,
          appointment: bookedAppt || null
        };
      });

      setScheduleData(mappedSchedule);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate, selectedVet]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            DUTY ROSTER
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>
            Veterinarian Schedule View
          </h2>
          <p className="text-sm text-muted">
            View veterinarian daily schedules, booked appointments, and available time slots.
          </p>
        </div>
      </div>

      <div className="card p-4 mb-6" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="form-group mb-0" style={{ minWidth: '250px' }}>
            <label className="form-label text-xs">Select Veterinarian</label>
            <select
              className="form-select"
              value={selectedVet}
              onChange={(e) => setSelectedVet(e.target.value)}
            >
              {vets.map(vet => (
                <option key={vet.name} value={vet.name}>{vet.name} ({vet.title})</option>
              ))}
            </select>
          </div>
          <div className="form-group mb-0" style={{ minWidth: '200px' }}>
            <label className="form-label text-xs">Select Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card p-6" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: '#12304A' }}>
          Schedule for {selectedVet} on {selectedDate}
        </h3>

        {loading ? (
          <div className="text-center p-8 text-muted">Loading schedule...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {scheduleData.length === 0 && (
              <div className="text-center p-8 text-muted">No schedule data available.</div>
            )}
            
            {scheduleData.map((slot, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: slot.isAvailable ? '#FFF8F3' : 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: slot.isAvailable ? '1px solid #FEE2E2' : '1px solid var(--border-light)',
                  fontSize: '0.85rem',
                }}
              >
                <div className="flex-1">
                  <span className="font-bold text-main" style={{ color: '#12304A' }}>{slot.timeSlot}</span>
                  {slot.appointment ? (
                    <div className="mt-1">
                      <p className="text-sm font-semibold text-main">{slot.appointment.petName} <span className="text-xs font-normal text-muted">({slot.appointment.ownerName})</span></p>
                      <p className="text-xs text-muted">{slot.appointment.serviceType} - {slot.appointment.reason}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted mt-0.5">Available for booking</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {slot.appointment ? (
                    <>
                      <StatusBadge status={slot.appointment.status} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setSelectedApptForView(slot.appointment)}
                        title="View Details"
                        style={{ padding: '0.35rem 0.5rem' }}
                      >
                        <Eye size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="badge badge-success">Available</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AppointmentDetailsModal
        appointment={selectedApptForView}
        onClose={() => setSelectedApptForView(null)}
      />
    </div>
  );
};
