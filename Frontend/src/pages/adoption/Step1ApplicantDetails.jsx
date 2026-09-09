import React from 'react';

export const Step1ApplicantDetails = ({ formData, updateFormData, errors }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ backgroundColor: 'var(--primary-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <p className="text-sm font-semibold text-primary">Applicant Information & Living Situation</p>
        <p className="text-xs text-muted mt-1">
          Please provide accurate details about your residence and schedule to help our Rescue Officers ensure a safe, loving match.
        </p>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Legal Name <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.applicantName || ''}
            onChange={(e) => updateFormData({ applicantName: e.target.value })}
            placeholder="e.g. Sarah Jenkins"
          />
          {errors?.applicantName && <span className="form-error">{errors.applicantName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Primary Email <span className="required">*</span></label>
          <input
            type="email"
            className="form-control"
            value={formData.applicantEmail || ''}
            onChange={(e) => updateFormData({ applicantEmail: e.target.value })}
            placeholder="e.g. sarah@example.com"
          />
          {errors?.applicantEmail && <span className="form-error">{errors.applicantEmail}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone Number <span className="required">*</span></label>
          <input
            type="tel"
            className="form-control"
            value={formData.applicantPhone || ''}
            onChange={(e) => updateFormData({ applicantPhone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
          {errors?.applicantPhone && <span className="form-error">{errors.applicantPhone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Current Occupation <span className="required">*</span></label>
          <input
            type="text"
            className="form-control"
            value={formData.occupation || ''}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
            placeholder="e.g. Architect / Remote Consultant"
          />
          {errors?.occupation && <span className="form-error">{errors.occupation}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Residential Address <span className="required">*</span></label>
        <input
          type="text"
          className="form-control"
          value={formData.applicantAddress || ''}
          onChange={(e) => updateFormData({ applicantAddress: e.target.value })}
          placeholder="Street address, city, state, zip code"
        />
        {errors?.applicantAddress && <span className="form-error">{errors.applicantAddress}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Housing Type <span className="required">*</span></label>
          <select
            className="form-select"
            value={formData.housingType || 'Own House'}
            onChange={(e) => updateFormData({ housingType: e.target.value })}
          >
            <option value="Own House">Own Single Family House</option>
            <option value="Rent House">Rent House</option>
            <option value="Rent Apartment">Rent Apartment / Flat</option>
            <option value="Condominium">Condominium / Townhouse</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Fenced Yard Status</label>
          <select
            className="form-select"
            value={formData.hasFencedYard ? 'yes' : 'no'}
            onChange={(e) => updateFormData({ hasFencedYard: e.target.value === 'yes' })}
          >
            <option value="yes">Yes - Fully Fenced Yard</option>
            <option value="no">No Fenced Yard / Shared Outdoor Area</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Pet Care Experience (Years)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={formData.petExperienceYears || 5}
            onChange={(e) => updateFormData({ petExperienceYears: Number(e.target.value) })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Estimated Daily Alone Hours for Pet</label>
          <input
            type="text"
            className="form-control"
            value={formData.dailyAloneHours || '2-4 hours'}
            onChange={(e) => updateFormData({ dailyAloneHours: e.target.value })}
            placeholder="e.g. 2-3 hours max (work from home)"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Current Pets in Household</label>
        <input
          type="text"
          className="form-control"
          value={formData.otherPetsDetails || ''}
          onChange={(e) => updateFormData({ otherPetsDetails: e.target.value, hasOtherPets: !!e.target.value })}
          placeholder="e.g. 1 Golden Retriever (3yo, vaccinated), 1 cat"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Why do you want to adopt this pet? <span className="required">*</span></label>
        <textarea
          className="form-textarea"
          rows={3}
          value={formData.reasonForAdoption || ''}
          onChange={(e) => updateFormData({ reasonForAdoption: e.target.value })}
          placeholder="Tell us about your home environment, lifestyle, and why you are excited to welcome this pet into your life..."
        />
        {errors?.reasonForAdoption && <span className="form-error">{errors.reasonForAdoption}</span>}
      </div>
    </div>
  );
};
