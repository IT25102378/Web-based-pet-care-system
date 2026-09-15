import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Step1ApplicantDetails } from './Step1ApplicantDetails';
import { Step2DocumentUpload } from './Step2DocumentUpload';
import { Step3TermsSignature } from './Step3TermsSignature';
import { Step4Confirmation } from './Step4Confirmation';
import { adoptionApi } from '../../api/adoptionApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, ArrowRight, Check, Heart, Loader2 } from 'lucide-react';
import { validateEmail } from '../../utils/validation';

export const AdoptionWizardModal = ({ isOpen, onClose, pet }) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    applicantName: currentUser?.fullName || '',
    applicantEmail: currentUser?.email || '',
    applicantPhone: currentUser?.phone || '',
    applicantAddress: currentUser?.address || '',
    occupation: '',
    housingType: 'Own House',
    hasFencedYard: true,
    petExperienceYears: 5,
    dailyAloneHours: '2-4 hours',
    hasOtherPets: false,
    otherPetsDetails: '',
    reasonForAdoption: '',
  });

  const [documents, setDocuments] = useState({
    idDoc: null,
    residenceDoc: null,
  });

  const [signature, setSignature] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(updates).forEach((k) => delete copy[k]);
      return copy;
    });
  };

  const updateDocuments = (updates) => {
    setDocuments((prev) => ({ ...prev, ...updates }));
    setErrors((prev) => {
      const copy = { ...prev };
      Object.keys(updates).forEach((k) => delete copy[k]);
      return copy;
    });
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.applicantName?.trim()) errs.applicantName = 'Full name is required';
      const emailError = validateEmail(formData.applicantEmail);
      if (emailError) errs.applicantEmail = emailError;
      if (!formData.applicantPhone?.trim()) errs.applicantPhone = 'Phone number is required';
      if (!formData.applicantAddress?.trim()) errs.applicantAddress = 'Address is required';
      if (!formData.occupation?.trim()) errs.occupation = 'Occupation is required';
      if (!formData.reasonForAdoption?.trim()) errs.reasonForAdoption = 'Please tell us why you wish to adopt';
    }
    if (step === 2) {
      if (!documents.idDoc) errs.idDoc = 'Government ID proof is required';
      if (!documents.residenceDoc) errs.residenceDoc = 'Proof of residence or lease document is required';
    }
    if (step === 3) {
      if (!signature) errs.signature = 'Please draw or type your digital signature';
      if (!termsAccepted) errs.terms = 'You must accept the adoption terms to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const applicationPayload = {
        caseId: pet?.caseId || 'RSC-2026-001',
        petName: pet?.temporaryName || 'Luna',
        applicantId: currentUser?.userId || 'USR-001',
        applicantName: formData.applicantName,
        applicantEmail: formData.applicantEmail,
        applicantPhone: formData.applicantPhone,
        applicantAddress: formData.applicantAddress,
        occupation: formData.occupation,
        housingType: formData.housingType,
        hasFencedYard: formData.hasFencedYard,
        petExperienceYears: formData.petExperienceYears,
        dailyAloneHours: formData.dailyAloneHours,
        hasOtherPets: !!formData.otherPetsDetails,
        otherPetsDetails: formData.otherPetsDetails,
        reasonForAdoption: formData.reasonForAdoption,
        termsAccepted: true,
        signatureDataUrl: signature,
        signedAt: new Date().toISOString(),
      };

      const uploadedDocsPayload = [
        {
          documentType: 'Government Issued Photo ID',
          fileName: documents.idDoc?.fileName || 'Government_ID.jpg',
          fileUrl: documents.idDoc?.url || documents.idDoc,
          fileSize: documents.idDoc?.fileSize || '1.1 MB',
        },
        {
          documentType: 'Proof of Residence / Lease Approval',
          fileName: documents.residenceDoc?.fileName || 'Proof_Of_Residence.pdf',
          fileUrl: documents.residenceDoc?.url || documents.residenceDoc,
          fileSize: documents.residenceDoc?.fileSize || '1.8 MB',
        },
      ];

      const created = await adoptionApi.submitApplication(applicationPayload, uploadedDocsPayload);
      setSubmittedApplication(created);
      setCurrentStep(4);
      showToast('Application Submitted', `Application ${created.applicationId} sent for review!`, 'success');
    } catch (err) {
      showToast('Submission Failed', err.message || 'Could not submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    '1. Applicant Details',
    '2. Document Uploads',
    '3. Terms & Signature',
    '4. Confirmation',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Adopt ${pet?.temporaryName || 'Pet'}`}
      subtitle={`Adoption Application Wizard — ${stepTitles[currentStep - 1]}`}
      size="lg"
      footer={
        currentStep < 4 ? (
          <div className="flex items-center justify-between" style={{ width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="flex items-center gap-2">
              <button type="button" className="btn btn-ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>

              {currentStep < 3 ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : null
      }
    >
      {/* Progress Indicator */}
      {currentStep < 4 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: currentStep >= step ? 700 : 500,
                  color: currentStep >= step ? 'var(--primary)' : 'var(--text-subtle)',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: currentStep >= step ? 'var(--primary)' : 'var(--bg-muted)',
                    color: currentStep >= step ? '#FFFFFF' : 'var(--text-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {step}
                </span>
                <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>
                  {step === 1 ? 'Details' : step === 2 ? 'Documents' : 'Terms & Signature'}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              height: '4px',
              backgroundColor: 'var(--border)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: 'var(--primary)',
                width: `${((currentStep - 1) / 2) * 100}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Wizard Steps */}
      {currentStep === 1 && (
        <Step1ApplicantDetails formData={formData} updateFormData={updateFormData} errors={errors} />
      )}
      {currentStep === 2 && (
        <Step2DocumentUpload documents={documents} updateDocuments={updateDocuments} errors={errors} />
      )}
      {currentStep === 3 && (
        <Step3TermsSignature
          formData={formData}
          updateFormData={updateFormData}
          signature={signature}
          setSignature={setSignature}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          errors={errors}
        />
      )}
      {currentStep === 4 && (
        <Step4Confirmation
          application={submittedApplication}
          pet={pet}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
