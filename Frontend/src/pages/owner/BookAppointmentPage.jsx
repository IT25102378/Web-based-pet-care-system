import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { petApi } from '../../api/petApi';
import { appointmentApi } from '../../api/appointmentApi';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { AppointmentDetailsModal } from '../../components/common/AppointmentDetailsModal';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  User,
  PawPrint,
  Check,
  Stethoscope,
  Plus,
  Filter,
  Eye,
  CalendarClock,
  Ban,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  FileText,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const BookAppointmentPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedPetId, setSelectedPetId] = useState('');
  const [serviceType, setServiceType] = useState('Routine Wellness & Vaccination');
  const [vetName, setVetName] = useState('Dr. Sachini Wijesinghe, BVSc');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Vaccination warning state
  const [petVaccineWarnings, setPetVaccineWarnings] = useState([]);

  // View Details Modal State
  const [selectedApptForView, setSelectedApptForView] = useState(null);

  // Reschedule Modal State
  const [apptToReschedule, setApptToReschedule] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newTimeSlot: '10:00 AM',
    newVetName: '',
    rescheduleReason: '',
  });
  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState([]);
  const [isRescheduleConfirmStep, setIsRescheduleConfirmStep] = useState(false);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  // Cancel Modal State
  const [apptToCancel, setApptToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const [userPets, userAppts] = await Promise.all([
        petApi.getPets(currentUser.userId),
        appointmentApi.getAppointments({ ownerId: currentUser.userId }),
      ]);
      setPets(userPets);
      if (userPets.length > 0 && !selectedPetId) {
        const firstPetId = userPets[0].petId;
        setSelectedPetId(firstPetId);
        // Load initial vaccine warnings for the first pet
        checkPetVaccinations(firstPetId);
      }
      setAppointments(userAppts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch vaccinations for the selected pet and surface any overdue/due-soon warnings
  const checkPetVaccinations = async (petId) => {
    if (!petId) { setPetVaccineWarnings([]); return; }
    try {
      const vacs = await petApi.getVaccinations(petId);
      const atRisk = vacs.filter((v) => v.status === 'Overdue' || v.status === 'Due Soon');
      setPetVaccineWarnings(atRisk);
    } catch {
      setPetVaccineWarnings([]);
    }
  };

  const handlePetSelection = (petId) => {
    setSelectedPetId(petId);
    checkPetVaccinations(petId);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Helper to check if appointment can be rescheduled or cancelled
  const isEligibleForAction = (appt) => {
    if (!appt) return false;
    const eligibleStatuses = [
      AppointmentStatus.SCHEDULED,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.PENDING,
      'Scheduled',
      'Confirmed',
      'Pending',
    ];
    if (!eligibleStatuses.includes(appt.status)) return false;

    // Past date check
    const today = new Date().toISOString().split('T')[0];
    if (appt.appointmentDate < today) return false;

    return true;
  };

  // -------------------------------------------------------------
  // Booking Submission
  // -------------------------------------------------------------
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPetId || !reason.trim()) {
      showToast('Form Incomplete', 'Please select a pet and state the visit reason.', 'error');
      return;
    }

    const petObj = pets.find((p) => p.petId === selectedPetId);
    setIsSubmittingBooking(true);

    try {
      const payload = {
        petId: selectedPetId,
        petName: petObj ? petObj.name : 'Patient',
        ownerId: currentUser.userId,
        ownerName: currentUser.fullName,
        ownerPhone: currentUser.phone || '+94 77 123 4567',
        vetId: 'USR-002',
        vetName,
        serviceType,
        appointmentDate,
        timeSlot,
        reason,
        symptoms: symptoms || 'Normal energy levels',
        notes: '',
      };

      const created = await appointmentApi.bookAppointment(payload);
      showToast('Appointment Booked', `Visit scheduled for ${created.appointmentDate} (Token: ${created.tokenNumber})`, 'success');
      setShowBookingForm(false);
      setReason('');
      setSymptoms('');
      loadData();
    } catch (err) {
      showToast('Booking Error', err.message || 'Failed to book appointment.', 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // -------------------------------------------------------------
  // Reschedule Workflow Handlers
  // -------------------------------------------------------------
  const handleOpenReschedule = async (appt) => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const initialDate = appt.appointmentDate >= tomorrow ? appt.appointmentDate : tomorrow;
    const initialVet = appt.vetName || 'Dr. Sachini Wijesinghe, BVSc';

    setApptToReschedule(appt);
    setRescheduleData({
      newDate: initialDate,
      newTimeSlot: appt.timeSlot || '10:00 AM',
      newVetName: initialVet,
      rescheduleReason: '',
    });
    setIsRescheduleConfirmStep(false);

    try {
      const slots = await appointmentApi.getAvailableSlots(initialVet, initialDate, appt.appointmentId);
      setRescheduleAvailableSlots(slots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRescheduleDateOrVetChange = async (newDate, newVet) => {
    setRescheduleData((prev) => ({
      ...prev,
      newDate,
      newVetName: newVet,
    }));

    try {
      const slots = await appointmentApi.getAvailableSlots(newVet, newDate, apptToReschedule?.appointmentId);
      setRescheduleAvailableSlots(slots);
      // Auto-select first available slot if current slot is taken
      const currentAvailable = slots.find((s) => s.timeSlot === rescheduleData.newTimeSlot && s.isAvailable);
      if (!currentAvailable) {
        const firstAvail = slots.find((s) => s.isAvailable);
        if (firstAvail) {
          setRescheduleData((prev) => ({ ...prev, newTimeSlot: firstAvail.timeSlot }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProceedToRescheduleConfirm = (e) => {
    e.preventDefault();
    if (!rescheduleData.newDate || !rescheduleData.newTimeSlot) {
      showToast('Validation Error', 'Please select a new date and time slot.', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (rescheduleData.newDate < today) {
      showToast('Validation Error', 'Cannot reschedule to a past date.', 'error');
      return;
    }

    setIsRescheduleConfirmStep(true);
  };

  const handleConfirmRescheduleSubmit = async () => {
    if (!apptToReschedule) return;
    setIsSubmittingReschedule(true);

    try {
      await appointmentApi.rescheduleAppointment(apptToReschedule.appointmentId, {
        newDate: rescheduleData.newDate,
        newTimeSlot: rescheduleData.newTimeSlot,
        newVetName: rescheduleData.newVetName,
        rescheduleReason: rescheduleData.rescheduleReason,
      });

      showToast(
        'Appointment Rescheduled',
        `Visit for ${apptToReschedule.petName} updated to ${rescheduleData.newDate} at ${rescheduleData.newTimeSlot}.`,
        'success'
      );

      setApptToReschedule(null);
      setIsRescheduleConfirmStep(false);
      if (selectedApptForView) setSelectedApptForView(null);
      loadData();
    } catch (err) {
      showToast('Reschedule Failed', err.message || 'Unable to reschedule visit.', 'error');
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // -------------------------------------------------------------
  // Cancel Workflow Handlers
  // -------------------------------------------------------------
  const handleOpenCancel = (appt) => {
    setApptToCancel(appt);
    setCancellationReason('');
  };

  const handleConfirmCancelSubmit = async () => {
    if (!apptToCancel) return;
    setIsSubmittingCancel(true);

    try {
      await appointmentApi.cancelAppointment(apptToCancel.appointmentId, {
        cancellationReason: cancellationReason.trim() || 'Cancelled by Pet Owner',
      });

      showToast(
        'Appointment Cancelled',
        `Visit for ${apptToCancel.petName} scheduled for ${apptToCancel.appointmentDate} has been cancelled.`,
        'success'
      );

      setApptToCancel(null);
      if (selectedApptForView) setSelectedApptForView(null);
      loadData();
    } catch (err) {
      showToast('Cancellation Failed', err.message || 'Unable to cancel appointment.', 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // -------------------------------------------------------------
  // Data Table Columns Configuration
  // -------------------------------------------------------------
  const columns = [
    {
      header: 'Token #',
      key: 'tokenNumber',
      sortable: true,
      render: (row) => (
        <span className="font-bold font-mono text-primary">
          {row.tokenNumber || row.appointmentId}
        </span>
      ),
    },
    {
      header: 'Pet Name',
      key: 'petName',
      sortable: true,
      render: (row) => (
        <div className="font-bold text-main flex items-center gap-2">
          <PawPrint size={14} className="text-primary" /> {row.petName}
        </div>
      ),
    },
    {
      header: 'Service / Reason',
      key: 'serviceType',
      render: (row) => (
        <div>
          <div className="font-semibold text-sm">{row.serviceType}</div>
          <div className="text-xs text-muted mt-0.5">{row.reason}</div>
          {row.rescheduledFrom && (
            <div className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
              <RefreshCw size={11} /> Rescheduled from {row.rescheduledFrom.date}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Doctor',
      key: 'vetName',
      render: (row) => <span className="text-xs font-medium">{row.vetName}</span>,
    },
    {
      header: 'Date & Slot',
      key: 'appointmentDate',
      sortable: true,
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-main">{row.appointmentDate}</div>
          <div className="text-muted">{row.timeSlot}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => {
        const eligible = isEligibleForAction(row);

        return (
          <div className="flex items-center gap-1">
            {/* View Details */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedApptForView(row)}
              title="View Appointment Details"
              style={{ padding: '0.35rem 0.5rem' }}
            >
              <Eye size={14} />
            </button>

            {/* Reschedule (Eligible only) */}
            {eligible && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => handleOpenReschedule(row)}
                title="Reschedule Appointment"
                style={{
                  padding: '0.3rem 0.55rem',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <CalendarClock size={13} /> Reschedule
              </button>
            )}

            {/* Cancel (Eligible only) */}
            {eligible && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleOpenCancel(row)}
                title="Cancel Appointment"
                style={{
                  color: 'var(--status-danger)',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <Ban size={13} /> Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            APPOINTMENT SCHEDULER
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Book & Manage Clinic Visits</h2>
          <p className="text-sm text-muted">
            Schedule routine checkups, view active queue status, reschedule consultations, or cancel upcoming visits.
          </p>
        </div>
        <button
          type="button"
          className="btn"
          style={{ backgroundColor: '#E76F51', color: '#FFFFFF', fontWeight: 700 }}
          onClick={() => setShowBookingForm(!showBookingForm)}
        >
          <Plus size={16} /> {showBookingForm ? 'Close Scheduler' : 'Book New Appointment'}
        </button>
      </div>

      {/* Booking Form Card */}
      {showBookingForm && (
        <div className="card p-6 mb-8" style={{ border: '2px solid #E76F51', backgroundColor: '#FFF8F3' }}>
          <h3 className="mb-4 flex items-center gap-2" style={{ color: '#12304A', fontSize: '1.25rem' }}>
            <Calendar size={20} color="#E76F51" /> Schedule a Doctor Consultation
          </h3>

          <form onSubmit={handleBookingSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Select Patient Companion <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={selectedPetId}
                  onChange={(e) => handlePetSelection(e.target.value)}
                  required
                >
                  {pets.map((pet) => (
                    <option key={pet.petId} value={pet.petId}>
                      {pet.name} ({pet.species} - {pet.breed})
                    </option>
                  ))}
                </select>

                {/* Vaccination warning banner */}
                {petVaccineWarnings.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #F59E0B',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertTriangle size={15} style={{ color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ fontSize: '0.78rem', color: '#92400E' }}>
                      <strong>Vaccination Alert:</strong>{' '}
                      {petVaccineWarnings.map((v) => v.vaccineName).join(', ')}{' '}
                      {petVaccineWarnings.length === 1 ? 'is' : 'are'}{' '}
                      <strong>
                        {petVaccineWarnings.some((v) => v.status === 'Overdue') ? 'overdue' : 'due soon'}
                      </strong>.
                      {' '}Please discuss with the vet during this visit.
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Service Type <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option value="Routine Wellness & Vaccination">Routine Wellness & Vaccination</option>
                  <option value="Dental Consultation & Cleaning">Dental Consultation & Cleaning</option>
                  <option value="Dermatology / Skin Care">Dermatology / Skin Care</option>
                  <option value="Orthopedic / Joint Exam">Orthopedic / Joint Exam</option>
                  <option value="Senior Health Checkup">Senior Health Checkup</option>
                  <option value="General Sick Patient Exam">General Sick Patient Exam</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preferred Veterinarian</label>
                <select
                  className="form-select"
                  value={vetName}
                  onChange={(e) => setVetName(e.target.value)}
                >
                  <option value="Dr. Sachini Wijesinghe, BVSc">Dr. Sachini Wijesinghe, BVSc (Small Animal Surgery)</option>
                  <option value="Dr. Michael Chen, DVM">Dr. Michael Chen, DVM (Internal Medicine)</option>
                  <option value="Dr. Amanda Ramirez, DVM">Dr. Amanda Ramirez, DVM (Feline & Dermatology)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Appointment Date <span className="required">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  value={appointmentDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Available Time Slot <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:30 PM">04:30 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Visit <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Annual booster vaccines and ear itching check"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Observed Symptoms / Notes for Doctor</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe any vomiting, lethargy, dietary changes, or specific concerns..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowBookingForm(false)}
                disabled={isSubmittingBooking}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSubmittingBooking}>
                {isSubmittingBooking ? (
                  'Scheduling Visit...'
                ) : (
                  <>
                    <Check size={16} /> Confirm Appointment Booking
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointment History Table */}
      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="Search visits by pet, token, doctor, status..."
        emptyMessage="No appointment bookings found."
      />

      <AppointmentDetailsModal
        appointment={selectedApptForView}
        onClose={() => setSelectedApptForView(null)}
        isEligibleForAction={isEligibleForAction}
        onReschedule={(appt) => handleOpenReschedule(appt)}
        onCancel={(appt) => handleOpenCancel(appt)}
      />

      {/* ========================================================================= */}
      {/* 2. RESCHEDULE APPOINTMENT WORKFLOW MODAL */}
      {/* ========================================================================= */}
      {apptToReschedule && (
        <Modal
          isOpen={!!apptToReschedule}
          onClose={() => !isSubmittingReschedule && setApptToReschedule(null)}
          title={`Reschedule Visit for ${apptToReschedule.petName}`}
          subtitle={
            isRescheduleConfirmStep
              ? 'Step 2 of 2: Review and confirm your updated appointment details'
              : 'Step 1 of 2: Select a new date, time slot, and preferred doctor'
          }
          size="lg"
        >
          {!isRescheduleConfirmStep ? (
            /* STEP 1: SELECT NEW DATE & TIME */
            <form onSubmit={handleProceedToRescheduleConfirm}>
              {/* Current Appointment Snapshot */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  marginBottom: '1.5rem',
                }}
              >
                <span className="text-xs font-bold text-muted block mb-1 uppercase tracking-wider">
                  Current Schedule on Record
                </span>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-bold text-main text-base">{apptToReschedule.petName}</p>
                    <p className="text-xs text-muted">{apptToReschedule.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">{apptToReschedule.vetName}</p>
                    <p className="text-xs text-muted">{apptToReschedule.appointmentDate} at {apptToReschedule.timeSlot}</p>
                  </div>
                </div>
              </div>

              {/* Reschedule Form Inputs */}
              <div className="form-row mb-4">
                <div className="form-group">
                  <label className="form-label">
                    Preferred Doctor <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={rescheduleData.newVetName}
                    onChange={(e) => handleRescheduleDateOrVetChange(rescheduleData.newDate, e.target.value)}
                    required
                  >
                    <option value="Dr. Sachini Wijesinghe, BVSc">Dr. Sachini Wijesinghe, BVSc (Small Animal Surgery)</option>
                    <option value="Dr. Michael Chen, DVM">Dr. Michael Chen, DVM (Internal Medicine)</option>
                    <option value="Dr. Amanda Ramirez, DVM">Dr. Amanda Ramirez, DVM (Feline & Dermatology)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    New Appointment Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={rescheduleData.newDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => handleRescheduleDateOrVetChange(e.target.value, rescheduleData.newVetName)}
                    required
                  />
                </div>
              </div>

              {/* Time Slot Selection with Availability Badges */}
              <div className="form-group mb-4">
                <label className="form-label">
                  Available Time Slots on {rescheduleData.newDate} <span className="required">*</span>
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                    gap: '0.5rem',
                    marginTop: '0.35rem',
                  }}
                >
                  {rescheduleAvailableSlots.map((slot) => {
                    const isSelected = rescheduleData.newTimeSlot === slot.timeSlot;
                    const isDisabled = !slot.isAvailable;

                    return (
                      <button
                        key={slot.timeSlot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setRescheduleData({ ...rescheduleData, newTimeSlot: slot.timeSlot })}
                        style={{
                          padding: '0.6rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          border: isSelected
                            ? '2px solid var(--primary)'
                            : isDisabled
                            ? '1px solid var(--border-light)'
                            : '1px solid var(--border)',
                          backgroundColor: isSelected
                            ? 'var(--primary-subtle)'
                            : isDisabled
                            ? 'var(--bg-muted)'
                            : '#FFFFFF',
                          color: isSelected
                            ? 'var(--primary)'
                            : isDisabled
                            ? 'var(--text-subtle)'
                            : 'var(--text-main)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          transition: 'var(--transition)',
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        <div>{slot.timeSlot}</div>
                        <div style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 600 }}>
                          {isDisabled ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Reschedule Reason */}
              <div className="form-group mb-6">
                <label className="form-label">Reason for Rescheduling (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={rescheduleData.rescheduleReason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, rescheduleReason: e.target.value })}
                  placeholder="e.g. Work commitment conflict, pet feeling better..."
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setApptToReschedule(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!rescheduleData.newTimeSlot}
                >
                  Review Changes <ArrowRight size={16} />
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: REVIEW & CONFIRM RESCHEDULE */
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1.25rem',
                  marginBottom: '1.5rem',
                }}
              >
                {/* Previous Schedule Card */}
                <div
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="badge badge-secondary mb-2">ORIGINAL SCHEDULE</span>
                  <p className="font-bold text-sm text-main">{apptToReschedule.petName}</p>
                  <p className="text-xs text-muted mt-1">{apptToReschedule.serviceType}</p>
                  <div className="mt-3 pt-3 border-top" style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="text-xs text-muted font-semibold">Doctor:</p>
                    <p className="text-sm font-medium text-main">{apptToReschedule.vetName}</p>
                    <p className="text-xs text-muted font-semibold mt-2">Date & Time:</p>
                    <p className="text-sm font-medium text-main">{apptToReschedule.appointmentDate} at {apptToReschedule.timeSlot}</p>
                  </div>
                </div>

                {/* New Schedule Card */}
                <div
                  style={{
                    backgroundColor: 'var(--primary-subtle)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '2px solid var(--primary)',
                  }}
                >
                  <span className="badge badge-primary mb-2">NEW SCHEDULE</span>
                  <p className="font-bold text-sm text-primary-dark">{apptToReschedule.petName}</p>
                  <p className="text-xs text-muted mt-1">{apptToReschedule.serviceType}</p>
                  <div className="mt-3 pt-3 border-top" style={{ borderTop: '1px solid rgba(42, 140, 130, 0.2)' }}>
                    <p className="text-xs text-muted font-semibold">Doctor:</p>
                    <p className="text-sm font-bold text-primary">{rescheduleData.newVetName}</p>
                    <p className="text-xs text-muted font-semibold mt-2">Date & Time:</p>
                    <p className="text-sm font-bold text-primary">{rescheduleData.newDate} at {rescheduleData.newTimeSlot}</p>
                  </div>
                </div>
              </div>

              {rescheduleData.rescheduleReason && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    marginBottom: '1.5rem',
                  }}
                >
                  <span className="text-xs font-semibold text-muted">Stated Reason:</span>
                  <p className="text-xs text-main font-medium mt-0.5">{rescheduleData.rescheduleReason}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRescheduleConfirmStep(false)}
                  disabled={isSubmittingReschedule}
                >
                  Back to Selection
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirmRescheduleSubmit}
                  disabled={isSubmittingReschedule}
                  style={{ minWidth: '180px' }}
                >
                  {isSubmittingReschedule ? (
                    'Saving Reschedule...'
                  ) : (
                    <>
                      <Check size={16} /> Confirm Reschedule
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 3. CANCEL APPOINTMENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {apptToCancel && (
        <Modal
          isOpen={!!apptToCancel}
          onClose={() => !isSubmittingCancel && setApptToCancel(null)}
          title="Cancel Appointment Confirmation"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--status-danger-bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #FECACA',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#991B1B' }}>
                  Are you sure you want to cancel?
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  This will release the reserved time slot for {apptToCancel.petName} with {apptToCancel.vetName}.
                </p>
              </div>
            </div>

            {/* Appointment Snapshot */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                fontSize: '0.85rem',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-main">{apptToCancel.petName} — {apptToCancel.serviceType}</span>
                <span className="font-mono text-xs text-primary font-bold">{apptToCancel.tokenNumber}</span>
              </div>
              <p className="text-xs text-muted">
                Scheduled on <strong>{apptToCancel.appointmentDate}</strong> at <strong>{apptToCancel.timeSlot}</strong> with <strong>{apptToCancel.vetName}</strong>.
              </p>
            </div>

            {/* Optional Cancellation Reason */}
            <div className="form-group">
              <label className="form-label">Reason for Cancellation (Optional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Pet recovered, scheduling conflict, booking another date..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setApptToCancel(null)}
                disabled={isSubmittingCancel}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmCancelSubmit}
                disabled={isSubmittingCancel}
                style={{ minWidth: '160px' }}
              >
                {isSubmittingCancel ? (
                  'Cancelling Visit...'
                ) : (
                  <>
                    <Ban size={16} /> Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
