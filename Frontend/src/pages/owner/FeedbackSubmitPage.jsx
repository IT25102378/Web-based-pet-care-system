import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api/feedbackApi';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Star,
  Send,
  MessageCircle,
  Clock,
  User,
  ShieldCheck,
} from 'lucide-react';

export const FeedbackSubmitPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [feedbacks, setFeedbacks] = useState([]);
  const [rating, setRating] = useState(5);
  const [serviceCategory, setServiceCategory] = useState('Veterinary Consultation');
  const [title, setTitle] = useState('');
  const [comments, setComments] = useState('');
  const [staffMentioned, setStaffMentioned] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFeedbacks = async () => {
    if (!currentUser) return;
    try {
      const list = await feedbackApi.getFeedbacks({ userId: currentUser.userId });
      setFeedbacks(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !comments.trim()) {
      showToast('Form Incomplete', 'Please provide a title and review comments.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await feedbackApi.submitFeedback({
        userId: currentUser.userId,
        userName: currentUser.fullName,
        serviceCategory,
        rating,
        title,
        comments,
        staffMentioned: staffMentioned || 'General Clinic Staff',
      });

      showToast('Feedback Submitted', 'Thank you for your feedback! Our management reviews every entry.', 'success');
      setTitle('');
      setComments('');
      setStaffMentioned('');
      setRating(5);
      loadFeedbacks();
    } catch (err) {
      showToast('Submission Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge mb-1" style={{ backgroundColor: '#FFF8F3', color: '#E76F51', fontWeight: 700 }}>
            PATIENT ADVOCACY
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#12304A' }}>Client Feedback & Service Ratings</h2>
          <p className="text-sm text-muted">
            Share your experiences regarding veterinary exams, grooming, surgical triage, or rescue adoption.
          </p>
        </div>
      </div>

      <div className="grid-2 mb-8">
        {/* Feedback Submission Form */}
        <div className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-primary">
            <MessageSquare size={20} /> Submit Review or Feedback
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Service Category <span className="required">*</span></label>
              <select
                className="form-select"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
              >
                <option value="Veterinary Consultation">Veterinary Consultation / Exam</option>
                <option value="Grooming & Spa">Grooming, Bath & Hydrotherapy</option>
                <option value="Boarding & Daycare">Boarding & Daycare</option>
                <option value="Rescue & Adoption Process">Rescue & Adoption Screening</option>
                <option value="Front Desk & Pharmacy">Front Desk & Pharmacy Support</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Overall Rating</label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star rating`}
                  >
                    <Star
                      size={28}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                      color={star <= rating ? '#F59E0B' : 'var(--border)'}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-main ml-2">{rating} out of 5 Stars</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Headline / Summary <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Outstanding surgical care by Dr. Chen"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Staff / Doctor / Provider Mentioned</label>
              <input
                type="text"
                className="form-control"
                value={staffMentioned}
                onChange={(e) => setStaffMentioned(e.target.value)}
                placeholder="e.g. Dr. Michael Chen, Marcus Vance"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Comments & Experience <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Tell us about the care provided to your pet, wait times, cleanliness, and treatment outcomes..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Send size={16} /> Submit Client Review
            </button>
          </form>
        </div>

        {/* Previous Feedback & Manager Replies */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-4">
            Your Previous Submissions ({feedbacks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {feedbacks.map((f) => (
              <div key={f.feedbackId} className="card p-4" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < f.rating ? '#F59E0B' : 'none'}
                        color={i < f.rating ? '#F59E0B' : 'var(--border)'}
                      />
                    ))}
                  </div>
                  <span className="badge badge-secondary text-xs">{f.serviceCategory}</span>
                </div>

                <h4 className="text-sm font-bold text-main">{f.title}</h4>
                <p className="text-xs text-muted mt-1" style={{ lineHeight: '1.5' }}>{f.comments}</p>
                <div className="text-xs text-muted mt-2">Staff: <strong>{f.staffMentioned}</strong></div>

                {/* Manager Response Banner */}
                {f.managerResponse && (
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--primary-subtle)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--primary)',
                    }}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                      <ShieldCheck size={14} />
                      <span>Clinic Manager Response:</span>
                    </div>
                    <p className="text-xs text-main" style={{ lineHeight: '1.4' }}>{f.managerResponse}</p>
                    <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>
                      Responded on {new Date(f.managerRespondedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
