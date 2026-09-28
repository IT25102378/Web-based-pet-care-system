import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { VivaArchitectureModal } from './VivaArchitectureModal';
import {
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  GraduationCap,
  Minimize2,
  Maximize2,
  Stethoscope,
  Heart,
  Package,
  Calendar,
  UserCheck,
} from 'lucide-react';

export const VivaPresenterBar = () => {
  const { currentUser, role, switchUserRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMinimized, setIsMinimized] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  const teamRoles = [
    {
      id: 'USR-001',
      memberNum: '1',
      roleName: 'Pet Owner',
      targetRole: UserRole.PET_OWNER,
      name: 'Kavindu Perera',
      assignedFunction: 'Pet Registry & Appointments',
      path: '/owner/overview',
      color: '#10B981',
    },
    {
      id: 'USR-003',
      memberNum: '2',
      roleName: 'Clinic Staff',
      targetRole: UserRole.CLINIC_STAFF,
      name: 'Nethmi Fernando',
      assignedFunction: 'Triage Queue & Scheduling',
      path: '/staff/queue',
      color: '#3B82F6',
    },
    {
      id: 'USR-006',
      memberNum: '3',
      roleName: 'Rescue Officer',
      targetRole: UserRole.RESCUE_OFFICER,
      name: 'Shehan Rajapaksha',
      assignedFunction: 'Intake, Foster & Adoption',
      path: '/rescue/dashboard',
      color: '#F59E0B',
    },
    {
      id: 'USR-002',
      memberNum: '4',
      roleName: 'Veterinarian',
      targetRole: UserRole.VETERINARIAN,
      name: 'Dr. Sachini Wijesinghe',
      assignedFunction: 'Consultations & Digital Rx',
      path: '/vet/schedule',
      color: '#8B5CF6',
    },
    {
      id: 'USR-004',
      memberNum: '5',
      roleName: 'Pet Care Provider',
      targetRole: UserRole.PET_CARE_PROVIDER,
      name: 'Dilshan Bandara',
      assignedFunction: 'Boarding, Grooming & Status',
      path: '/provider/dashboard',
      color: '#EC4899',
    },
    {
      id: 'USR-005',
      memberNum: '6',
      roleName: 'Clinic Manager',
      targetRole: UserRole.CLINIC_MANAGER,
      name: 'Himashi Gunawardena',
      assignedFunction: 'Inventory Alerts & Suppliers',
      path: '/manager/dashboard',
      color: '#E76F51',
    },
    {
      id: 'USR-007',
      memberNum: 'Admin',
      roleName: 'System Admin',
      targetRole: UserRole.ADMIN,
      name: 'System Admin',
      assignedFunction: 'Approvals & User Roster',
      path: '/admin/dashboard',
      color: '#64748B',
    },
  ];

  const handleHandover = (member) => {
    switchUserRole(member.targetRole, member.id);
    showToast(
      `Handover to Member ${member.memberNum}: ${member.roleName}`,
      `Active Session: ${member.name} (${member.assignedFunction})`,
      'info',
      3500
    );
    navigate(member.path);
  };

  const handleScenario = (scenarioKey) => {
    if (scenarioKey === 'clinical') {
      switchUserRole(UserRole.PET_OWNER, 'USR-001');
      navigate('/owner/appointments');
      showToast('Scenario 1: Clinical Flow', 'Switched to Pet Owner to demonstrate booking and consultation flow.', 'success');
    } else if (scenarioKey === 'rescue') {
      switchUserRole(UserRole.RESCUE_OFFICER, 'USR-006');
      navigate('/rescue/cases');
      showToast('Scenario 2: Rescue to Adoption Flow', 'Switched to Rescue Officer to demonstrate intake, foster, and adoption.', 'success');
    } else if (scenarioKey === 'inventory') {
      switchUserRole(UserRole.CLINIC_MANAGER, 'USR-005');
      navigate('/manager/inventory');
      showToast('Scenario 3: Inventory & Supplier PO Flow', 'Switched to Clinic Manager to demonstrate low-stock alerts and restock orders.', 'success');
    }
  };

  // Minimized Floating Pill
  if (isMinimized) {
    return (
      <>
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
          onClick={() => setIsMinimized(false)}
          title="Click to expand Viva Presenter Controller"
        >
          <GraduationCap size={18} color="#38BDF8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            SE2030 VIVA CONTROLLER
          </span>
          <span className="badge badge-accent text-xs" style={{ padding: '2px 6px', fontSize: '0.7rem' }}>
            Role: {role || 'Public'}
          </span>
          <Maximize2 size={14} style={{ opacity: 0.7 }} />
        </div>

        <VivaArchitectureModal
          isOpen={isArchModalOpen}
          onClose={() => setIsArchModalOpen(false)}
        />
      </>
    );
  }

  // Expanded Presenter Bar
  return (
    <>
      <div
        style={{
          background: 'linear-gradient(90deg, #090E17 0%, #0F172A 50%, #090E17 100%)',
          color: '#F8FAFC',
          borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
          padding: '7px 18px',
          zIndex: 9990,
          position: 'relative',
          fontSize: '0.8rem',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: Brand & Architecture Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-bold" style={{ color: '#38BDF8', letterSpacing: '0.04em' }}>
              <GraduationCap size={18} />
              <span className="hidden sm:inline">SE2030 VIVA CONTROLLER</span>
            </div>

            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                color: '#38BDF8',
                borderColor: 'rgba(56, 189, 248, 0.5)',
                fontSize: '0.75rem',
                padding: '4px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: 750,
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(56, 189, 248, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setIsArchModalOpen(true)}
              title="Inspect Design Patterns, Rubric Mapping, and Viva Defense Cheat-Sheet"
            >
              <Award size={14} />
              <span>Design Patterns & Rubric (70 Marks)</span>
            </button>

            {/* Quick Scenario Dropdown */}
            <select
              className="form-select text-xs"
              style={{
                backgroundColor: '#1E293B',
                color: '#F1F5F9',
                borderColor: 'rgba(148, 163, 184, 0.3)',
                borderRadius: '8px',
                padding: '4px 10px',
                width: 'auto',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
              onChange={(e) => {
                if (e.target.value) {
                  handleScenario(e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>▶ Launch Demo Flow...</option>
              <option value="clinical">1. Clinical Care Flow (Owner → Staff → Vet)</option>
              <option value="rescue">2. Rescue to Adoption Flow (Intake → Foster → Adopt)</option>
              <option value="inventory">3. Low-Stock Alert & Supplier PO Flow</option>
            </select>
          </div>

          {/* Center: 6 Members Handover Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold mr-1 hidden md:inline">
              Handover:
            </span>
            {teamRoles.map((m) => {
              const isActive = (role === m.targetRole);
              return (
                <button
                  key={m.id}
                  type="button"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${m.color} 0%, rgba(15, 23, 42, 0.9) 120%)`
                      : 'rgba(30, 41, 59, 0.7)',
                    color: '#FFFFFF',
                    border: `1px solid ${isActive ? m.color : 'rgba(71, 85, 105, 0.6)'}`,
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 800 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: isActive ? `0 0 12px ${m.color}66` : 'none',
                    transform: isActive ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onClick={() => handleHandover(m)}
                  title={`Member ${m.memberNum} (${m.name}): ${m.assignedFunction}`}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#FFFFFF' : m.color,
                      boxShadow: isActive ? `0 0 6px #FFFFFF` : 'none',
                    }}
                  />
                  <span>M{m.memberNum}: {m.roleName}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Minimize Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
              onClick={() => setIsMinimized(true)}
              title="Minimize controller bar"
            >
              <Minimize2 size={15} />
            </button>
          </div>
        </div>
      </div>

      <VivaArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </>
  );
};
