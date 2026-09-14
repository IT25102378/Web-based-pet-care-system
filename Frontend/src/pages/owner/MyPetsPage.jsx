import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { petApi } from '../../api/petApi';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FileUploadField } from '../../components/common/FileUploadField';
import { useToast } from '../../context/ToastContext';
import {
  PawPrint,
  Plus,
  Edit2,
  Trash2,
  Syringe,
  AlertCircle,
  Phone,
  Shield,
  Calendar,
  Check,
  FileText,
  Download,
  ExternalLink,
  UploadCloud,
  FolderOpen,
  Eye,
  FileCheck,
  Pill,
  Activity,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const MyPetsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [pets, setPets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);

  // Pet Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Document Upload Modal
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [docTypeFilter, setDocTypeFilter] = useState('ALL');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Document Delete Confirmation Modal
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeletingDoc, setIsDeletingDoc] = useState(false);

  // Document Form State
  const [docFormData, setDocFormData] = useState({
    documentType: 'Vaccination Certificate',
    customTitle: '',
    notes: '',
    uploadedFile: null,
  });

  // Pet Form State
  const [formData, setFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    gender: 'Male',
    ageYears: 2,
    dateOfBirth: '2024-01-01',
    weightKg: 10,
    microchipId: '',
    allergies: '',
    medicalNotes: '',
    emergencyContact: '',
    imageUrl: '',
  });

  const loadData = async () => {
    if (!currentUser) return;
    try {
      const userPets = await petApi.getPets(currentUser.userId);
      setPets(userPets || []);

      if (userPets && userPets.length > 0) {
        setSelectedPet((prev) => {
          if (!prev) return userPets[0];
          const exists = userPets.find((p) => p.petId === prev.petId);
          return exists || userPets[0];
        });
      }

      // Fetch vaccinations and documents safely so one error cannot block pet display
      const [userVacsResult, userDocsResult] = await Promise.allSettled([
        petApi.getVaccinations(),
        petApi.getPetDocuments(null, currentUser.userId),
      ]);
      if (userVacsResult.status === 'fulfilled') {
        setVaccinations(userVacsResult.value || []);
      }
      if (userDocsResult.status === 'fulfilled') {
        setDocuments(userDocsResult.value || []);
      }
    } catch (e) {
      console.error('Error loading pet data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Pet Add/Edit Handlers
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      species: 'Dog',
      breed: '',
      gender: 'Male',
      ageYears: 1,
      dateOfBirth: new Date().toISOString().split('T')[0],
      weightKg: 5,
      microchipId: `98514100${Math.floor(1000000 + Math.random() * 9000000)}`,
      allergies: 'None',
      medicalNotes: '',
      emergencyContact: `${currentUser.fullName} - ${currentUser.phone || '+94 77 123 4567'}`,
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pet) => {
    setIsEditing(true);
    setFormData({ ...pet });
    setIsModalOpen(true);
  };

  const handleSavePet = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.breed) {
      showToast('Validation Error', 'Pet name and breed are required.', 'error');
      return;
    }

    try {
      if (isEditing) {
        await petApi.updatePet(formData.petId, formData);
        showToast('Profile Updated', `${formData.name}'s profile was updated.`, 'success');
      } else {
        const created = await petApi.createPet({
          ...formData,
          ownerId: currentUser.userId,
          ownerName: currentUser.fullName,
        });
        showToast('Pet Registered', `${created.name} is now registered in Pet Nexus!`, 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  // Document Upload Handlers
  const handleOpenUploadDoc = () => {
    setDocFormData({
      documentType: 'Vaccination Certificate',
      customTitle: '',
      notes: '',
      uploadedFile: null,
    });
    setIsUploadDocModalOpen(true);
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!selectedPet) {
      showToast('Selection Error', 'Please select a companion pet first.', 'error');
      return;
    }
    if (!docFormData.uploadedFile) {
      showToast('Validation Error', 'Please select or upload a document file.', 'error');
      return;
    }

    setIsUploadingDoc(true);
    try {
      const fileName = docFormData.customTitle.trim()
        ? (docFormData.customTitle.trim().endsWith('.pdf') || docFormData.customTitle.trim().endsWith('.jpg') || docFormData.customTitle.trim().endsWith('.png')
            ? docFormData.customTitle.trim()
            : `${docFormData.customTitle.trim()}.pdf`)
        : docFormData.uploadedFile.fileName || `${selectedPet.name}_Document.pdf`;

      await petApi.uploadPetDocument({
        petId: selectedPet.petId,
        petName: selectedPet.name,
        ownerId: currentUser.userId,
        documentType: docFormData.documentType,
        fileName,
        fileUrl: docFormData.uploadedFile.url || 'https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=600&auto=format&fit=crop&q=80',
        fileSize: docFormData.uploadedFile.fileSize || '1.0 MB',
        notes: docFormData.notes.trim() || undefined,
      });

      showToast('Document Uploaded', `${fileName} has been added to ${selectedPet.name}'s records.`, 'success');
      setIsUploadDocModalOpen(false);
      loadData();
    } catch (err) {
      showToast('Upload Failed', err.message || 'Unable to save document.', 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Document Delete Handlers
  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete) return;
    setIsDeletingDoc(true);
    try {
      await petApi.deletePetDocument(docToDelete.documentId);
      showToast('Document Deleted', `"${docToDelete.fileName}" was removed successfully.`, 'success');
      setDocToDelete(null);
      loadData();
    } catch (err) {
      showToast('Delete Failed', err.message || 'Unable to delete document.', 'error');
    } finally {
      setIsDeletingDoc(false);
    }
  };

  // Helper for document icon & badge style based on type
  const getDocumentTypeBadge = (type) => {
    switch (type) {
      case 'Vaccination Certificate':
        return {
          icon: Syringe,
          className: 'badge-success',
          label: 'Vaccination Certificate',
        };
      case 'Prescription':
        return {
          icon: Pill,
          className: 'badge-primary',
          label: 'Prescription',
        };
      case 'Medical Report':
        return {
          icon: Activity,
          className: 'badge-info',
          label: 'Medical Report',
        };
      default:
        return {
          icon: FileText,
          className: 'badge-secondary',
          label: type || 'Other',
        };
    }
  };

  const petVacs = selectedPet
    ? vaccinations.filter((v) => v.petId === selectedPet.petId)
    : [];

  const petDocs = selectedPet
    ? documents.filter((d) => d.petId === selectedPet.petId)
    : [];

  const filteredDocs = petDocs.filter((doc) => {
    if (docTypeFilter === 'ALL') return true;
    return doc.documentType === docTypeFilter;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="badge badge-primary mb-1">PATIENT PROFILES</span>
          <h2>My Pets & Health Records</h2>
          <p className="text-sm text-muted">
            Manage your companion profiles, microchip IDs, vaccination records, emergency instructions, and health documents.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Register New Pet
        </button>
      </div>

      {/* Pet Selection Cards */}
      <div className="grid-3 mb-8">
        {pets.map((pet) => (
          <div
            key={pet.petId}
            className={`card card-hoverable ${selectedPet?.petId === pet.petId ? 'border-primary' : ''}`}
            style={{
              borderWidth: selectedPet?.petId === pet.petId ? '2px' : '1px',
              borderColor: selectedPet?.petId === pet.petId ? 'var(--primary)' : 'var(--border)',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedPet(pet)}
          >
            <div style={{ height: '180px', position: 'relative' }}>
              <img
                src={pet.imageUrl}
                alt={pet.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {pet.species} • {pet.gender}
              </div>
            </div>

            <div className="card-body">
              <div className="flex items-center justify-between mb-1">
                <h3 style={{ fontSize: '1.25rem' }}>{pet.name}</h3>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEdit(pet);
                  }}
                  title="Edit Profile"
                >
                  <Edit2 size={15} />
                </button>
              </div>
              <p className="text-xs text-primary font-semibold mb-2">{pet.breed}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Age: {pet.ageYears} yrs</span>
                <span>Weight: {pet.weightKg} kg</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Pet Full Health & Document View */}
      {selectedPet && (
        <div className="card p-6 mb-8">
          {/* Pet Header Bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4 border-bottom pb-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-4">
              <img
                src={selectedPet.imageUrl}
                alt={selectedPet.name}
                style={{ width: '70px', height: '70px', borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
              />
              <div>
                <h2>{selectedPet.name}</h2>
                <p className="text-sm text-muted">
                  {selectedPet.species} • {selectedPet.breed} • {selectedPet.gender} • Born {selectedPet.dateOfBirth}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(selectedPet)}>
                <Edit2 size={14} /> Edit Information
              </button>
            </div>
          </div>

          {/* Quick Pet Details */}
          <div className="grid-2 mb-6">
            {/* Left Column: Identifiers & Emergency */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs font-semibold text-muted">Universal Microchip ID</span>
                <p className="text-sm font-bold font-mono text-primary mt-1">{selectedPet.microchipId}</p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs font-semibold text-muted">Emergency Contact</span>
                <p className="text-sm font-semibold text-main mt-1">{selectedPet.emergencyContact}</p>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs font-semibold text-muted">Recorded Allergies</span>
                <p className="text-sm font-semibold text-danger mt-1">{selectedPet.allergies || 'None recorded'}</p>
              </div>
            </div>

            {/* Right Column: Medical Notes */}
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
              <span className="text-xs font-semibold text-muted">Clinical & Behavioral Notes</span>
              <p className="text-sm text-main mt-2" style={{ lineHeight: '1.6' }}>
                {selectedPet.medicalNotes || 'No special clinical restrictions noted.'}
              </p>
            </div>
          </div>

          {/* Vaccination Schedule Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-main">
                <Syringe size={16} className="text-primary" /> Vaccination History & Booster Schedule
              </h4>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Batch #</th>
                    <th>Administered Date</th>
                    <th>Next Due Date</th>
                    <th>Administered By</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {petVacs.length > 0 ? (
                    petVacs.map((vac) => (
                      <tr key={vac.vaccineId}>
                        <td className="font-semibold text-main">{vac.vaccineName}</td>
                        <td className="font-mono text-xs text-muted">{vac.batchNumber}</td>
                        <td>{vac.administeredDate}</td>
                        <td className="font-bold text-primary">{vac.nextDueDate}</td>
                        <td className="text-xs text-muted">{vac.administeredBy}</td>
                        <td><StatusBadge status={vac.status} /></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                        No vaccination logs on record.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* FEATURE 2: DOCUMENTS SECTION */}
          {/* ========================================================================= */}
          <div className="border-top pt-6" style={{ borderTop: '2px solid var(--border-light)' }}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2 text-main">
                  <FolderOpen size={20} className="text-primary" /> Health & Clinical Documents
                </h3>
                <p className="text-xs text-muted mt-1">
                  Upload, store, and manage vaccination certificates, digital prescriptions, lab diagnostic reports, and registration files for {selectedPet.name}.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenUploadDoc}
                >
                  <Plus size={15} /> Upload Document
                </button>
              </div>
            </div>

            {/* Document Type Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm ${docTypeFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDocTypeFilter('ALL')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                All Documents ({petDocs.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${docTypeFilter === 'Vaccination Certificate' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDocTypeFilter('Vaccination Certificate')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Vaccination Certificates ({petDocs.filter((d) => d.documentType === 'Vaccination Certificate').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${docTypeFilter === 'Prescription' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDocTypeFilter('Prescription')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Prescriptions ({petDocs.filter((d) => d.documentType === 'Prescription').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${docTypeFilter === 'Medical Report' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDocTypeFilter('Medical Report')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Medical Reports ({petDocs.filter((d) => d.documentType === 'Medical Report').length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${docTypeFilter === 'Other' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setDocTypeFilter('Other')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
              >
                Other ({petDocs.filter((d) => d.documentType === 'Other').length})
              </button>
            </div>

            {/* Documents Table View */}
            {filteredDocs.length > 0 ? (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>File Name & Details</th>
                      <th>Upload Date</th>
                      <th>File Size</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => {
                      const badgeInfo = getDocumentTypeBadge(doc.documentType);
                      const BadgeIcon = badgeInfo.icon;
                      const formattedDate = doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent';

                      return (
                        <tr key={doc.documentId}>
                          {/* Document Type */}
                          <td>
                            <span className={`badge ${badgeInfo.className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <BadgeIcon size={12} />
                              {badgeInfo.label}
                            </span>
                          </td>

                          {/* File Name & Notes */}
                          <td>
                            <div className="flex items-center gap-3">
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--primary-subtle)',
                                  color: 'var(--primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <FileText size={18} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-main" style={{ lineHeight: 1.2 }}>
                                  {doc.fileName}
                                </p>
                                {doc.notes && (
                                  <p className="text-xs text-muted mt-0.5" style={{ maxWidth: '380px' }}>
                                    {doc.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Upload Date */}
                          <td className="text-xs text-muted">
                            {formattedDate}
                          </td>

                          {/* File Size */}
                          <td className="font-mono text-xs text-muted">
                            {doc.fileSize || '1.0 MB'}
                          </td>

                          {/* Actions: View/Download and Delete */}
                          <td>
                            <div className="flex items-center justify-end gap-2">
                              {/* View / Download Action */}
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                download={doc.fileName}
                                className="btn btn-secondary btn-sm"
                                title="View or Download Document"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.65rem', fontSize: '0.775rem' }}
                              >
                                <Eye size={13} /> View / Download
                              </a>

                              {/* Delete Action with Confirmation */}
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => setDocToDelete(doc)}
                                title="Delete Document"
                                style={{ color: 'var(--status-danger)', padding: '0.35rem 0.5rem' }}
                                aria-label="Delete document"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '2.5rem 1.5rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--border)',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <FileCheck size={24} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  No Documents Found
                </h4>
                <p className="text-xs text-muted mb-4" style={{ maxWidth: '400px', margin: '0 auto 1rem' }}>
                  {docTypeFilter === 'ALL'
                    ? `No health or clinical documents have been uploaded for ${selectedPet.name} yet.`
                    : `No "${docTypeFilter}" records exist for ${selectedPet.name}.`}
                </p>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleOpenUploadDoc}
                >
                  <Plus size={14} /> Upload First Document
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PET MODAL */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={isEditing ? `Edit ${formData.name}'s Profile` : 'Register New Companion'}
          size="lg"
        >
          <form onSubmit={handleSavePet}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pet Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Barnaby"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Species <span className="required">*</span></label>
                <select
                  className="form-select"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                >
                  <option value="Dog">Dog (Canine)</option>
                  <option value="Cat">Cat (Feline)</option>
                  <option value="Rabbit">Rabbit</option>
                  <option value="Bird">Bird (Avian)</option>
                  <option value="Other">Other Exotic</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Breed <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g. Golden Retriever"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Male (Neutered)">Male (Neutered)</option>
                  <option value="Female (Spayed)">Female (Spayed)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Microchip ID</label>
              <input
                type="text"
                className="form-control font-mono"
                value={formData.microchipId}
                onChange={(e) => setFormData({ ...formData, microchipId: e.target.value })}
                placeholder="15-digit standard microchip"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Allergies</label>
              <input
                type="text"
                className="form-control"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="e.g. Chicken protein, Penicillin"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Info</label>
              <input
                type="text"
                className="form-control"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Name & Telephone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Medical Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={formData.medicalNotes}
                onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                placeholder="Behavioral traits, dietary requirements, past surgeries..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Companion Profile
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* UPLOAD DOCUMENT MODAL */}
      {/* ========================================================================= */}
      {isUploadDocModalOpen && selectedPet && (
        <Modal
          isOpen={isUploadDocModalOpen}
          onClose={() => !isUploadingDoc && setIsUploadDocModalOpen(false)}
          title={`Upload Document for ${selectedPet.name}`}
          subtitle="Add vaccination cards, digital prescriptions, lab test reports, or other medical records."
          size="lg"
        >
          <form onSubmit={handleSaveDocument}>
            <div className="form-row mb-4">
              <div className="form-group">
                <label className="form-label">
                  Document Type <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={docFormData.documentType}
                  onChange={(e) => setDocFormData({ ...docFormData, documentType: e.target.value })}
                  required
                >
                  <option value="Vaccination Certificate">Vaccination Certificate</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Medical Report">Medical Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Document Title / Custom Label
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={docFormData.customTitle}
                  onChange={(e) => setDocFormData({ ...docFormData, customTitle: e.target.value })}
                  placeholder={`e.g. ${selectedPet.name}_Rabies_Booster_2026`}
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Clinical / Reference Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={docFormData.notes}
                onChange={(e) => setDocFormData({ ...docFormData, notes: e.target.value })}
                placeholder="Optional comments regarding dosage, issuing veterinarian, or diagnostic summary..."
              />
            </div>

            {/* Reusable FileUploadField */}
            <div className="mb-6">
              <FileUploadField
                label="Attach Document File"
                hint="Supported formats: PDF, PNG, JPG (Max 10MB)"
                accept="application/pdf,image/*"
                required={true}
                value={docFormData.uploadedFile}
                onChange={(fileResult) => setDocFormData({ ...docFormData, uploadedFile: fileResult })}
                disabled={isUploadingDoc}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsUploadDocModalOpen(false)}
                disabled={isUploadingDoc}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isUploadingDoc || !docFormData.uploadedFile}
                style={{ minWidth: '160px' }}
              >
                {isUploadingDoc ? (
                  'Uploading Document...'
                ) : (
                  <>
                    <UploadCloud size={16} /> Save & Attach Document
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* DELETE DOCUMENT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {docToDelete && (
        <Modal
          isOpen={!!docToDelete}
          onClose={() => !isDeletingDoc && setDocToDelete(null)}
          title="Delete Document Confirmation"
          size="sm"
        >
          <div className="flex flex-col items-center text-center p-2">
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-danger-bg)',
                color: 'var(--status-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Confirm Deletion
            </h4>
            <p className="text-sm text-muted mb-2">
              Are you sure you want to permanently delete <strong>{docToDelete.fileName}</strong> for <strong>{docToDelete.petName || selectedPet?.name}</strong>?
            </p>
            <p className="text-xs text-danger font-medium mb-6">
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDocToDelete(null)}
                disabled={isDeletingDoc}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleConfirmDeleteDoc}
                disabled={isDeletingDoc}
              >
                {isDeletingDoc ? 'Deleting...' : 'Delete Document'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
