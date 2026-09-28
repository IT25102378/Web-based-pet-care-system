import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api/feedbackApi';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Star,
  Send,
  MessageCircle,
  Clock,
  User,
  ShieldCheck,
  Edit2,
  Trash2,
  Check,
  AlertTriangle,
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

  // Edit State
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    rating: 5,
    serviceCategory: 'Veterinary Consultation',
    comments: '',
    staffMentioned: '',
  });

  // Delete State
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleOpenEdit = (f) => {
    setEditingFeedback(f);
    setEditFormData({
      title: f.title || '',
      rating: f.rating || 5,
      serviceCategory: f.serviceCategory || 'Veterinary Consultation',
      comments: f.comments || '',
      staffMentioned: f.staffMentioned || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.title.trim() || editFormData.title.trim().length < 5) {
      showToast('Validation Error', 'Title must be at least 5 characters.', 'error');
      return;
    }
    if (!editFormData.comments.trim() || editFormData.comments.trim().length < 10) {
      showToast('Validation Error', 'Comments must be at least 10 characters for clinical review.', 'error');
      return;
    }

    try {
      await feedbackApi.updateFeedback(editingFeedback.feedbackId, {
        title: editFormData.title.trim(),
        rating: editFormData.rating,
        serviceCategory: editFormData.serviceCategory,
        comments: editFormData.comments.trim(),
        staffMentioned: editFormData.staffMentioned.trim(),
      });
      showToast('Feedback Updated', 'Your review modifications have been saved.', 'success');
      setIsEditModalOpen(false);
      setEditingFeedback(null);
      loadFeedbacks();
    } catch (err) {
      showToast('Update Failed', err.message || 'Could not update feedback.', 'error');
    }
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    setIsDeleting(true);
    try {
      await feedbackApi.deleteFeedback(feedbackToDelete.feedbackId);
      showToast('Feedback Removed', 'Your review submission has been deleted.', 'info');
      setFeedbackToDelete(null);
      loadFeedbacks();
    } catch (err) {
      showToast('Delete Failed', err.message || 'Could not remove feedback.', 'error');
    } finally {
      setIsDeleting(false);
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
            {feedbacks.length === 0 ? (
              <div className="card p-6 text-center text-muted">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No feedback submissions found yet. Fill out the form to share your experience!</p>
              </div>
            ) : (
              feedbacks.map((f) => (
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
                    <div className="flex items-center gap-2">
                      <span className="badge badge-secondary text-xs">{f.serviceCategory}</span>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.2rem 0.4rem' }}
                        title="Edit Feedback"
                        onClick={() => handleOpenEdit(f)}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm text-danger"
                        style={{ padding: '0.2rem 0.4rem' }}
                        title="Delete Feedback"
                        onClick={() => setFeedbackToDelete(f)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
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
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Feedback Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Submitted Review"
        >
          <form onSubmit={handleSaveEdit}>
            <div className="form-group">
              <label className="form-label">Service Category</label>
              <select
                className="form-select"
                value={editFormData.serviceCategory}
                onChange={(e) => setEditFormData({ ...editFormData, serviceCategory: e.target.value })}
              >
                <option value="Veterinary Consultation">Veterinary Consultation / Exam</option>
                <option value="Grooming & Spa">Grooming, Bath & Hydrotherapy</option>
                <option value="Boarding & Daycare">Boarding & Daycare</option>
                <option value="Rescue & Adoption Process">Rescue & Adoption Screening</option>
                <option value="Front Desk & Pharmacy">Front Desk & Pharmacy Support</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="flex items-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    onClick={() => setEditFormData({ ...editFormData, rating: star })}
                  >
                    <Star
                      size={24}
                      fill={star <= editFormData.rating ? '#F59E0B' : 'none'}
                      color={star <= editFormData.rating ? '#F59E0B' : 'var(--border)'}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-main ml-2">{editFormData.rating} / 5 Stars</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Title <span className="required">*</span></label>
              <input
                type="text"
                className="form-control"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Staff Mentioned</label>
              <input
                type="text"
                className="form-control"
                value={editFormData.staffMentioned}
                onChange={(e) => setEditFormData({ ...editFormData, staffMentioned: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Review Comments <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={editFormData.comments}
                onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
                required
              />
            </div>

            <div className="modal-actions flex justify-end gap-3 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Check size={16} /> Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Feedback Confirmation Modal */}
      {feedbackToDelete && (
        <Modal
          isOpen={Boolean(feedbackToDelete)}
          onClose={() => setFeedbackToDelete(null)}
          title="Delete Client Feedback"
        >
          <div className="p-2">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <AlertTriangle size={28} />
              <div>
                <h4 className="text-base font-bold text-main">Confirm Review Removal</h4>
                <p className="text-xs text-muted">
                  Are you sure you want to permanently delete your review: <strong>"{feedbackToDelete.title}"</strong>?
                </p>
              </div>
            </div>
            <div className="modal-actions flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setFeedbackToDelete(null)} disabled={isDeleting}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDeleteFeedback} disabled={isDeleting}>
                <Trash2 size={16} /> {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

