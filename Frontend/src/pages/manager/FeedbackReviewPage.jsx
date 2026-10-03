import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../../api/feedbackApi';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Star, Reply, Check, ShieldCheck } from 'lucide-react';

export const FeedbackReviewPage = () => {
  const { showToast } = useToast();
  const [feedbacks, setFeedbacks] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadFeedbacks = async () => {
    try {
      const list = await feedbackApi.getFeedbacks();
      setFeedbacks(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim()) return;

    setSubmitting(true);
    try {
      await feedbackApi.respondToFeedback(respondingTo.feedbackId, responseText);
      showToast('Response Published', `Official response attached to review #${respondingTo.feedbackId}`, 'success');
      setRespondingTo(null);
      setResponseText('');
      loadFeedbacks();
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Review ID',
      key: 'feedbackId',
      sortable: true,
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.feedbackId}</span>,
    },
    {
      header: 'Client & Category',
      key: 'userName',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-bold text-sm text-main">{row.userName}</div>
          <span className="badge badge-secondary text-xs">{row.serviceCategory}</span>
        </div>
      ),
    },
    {
      header: 'Rating',
      key: 'rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 text-xs font-bold text-amber">
          <Star size={14} fill="#F59E0B" color="#F59E0B" /> {row.rating}/5
        </div>
      ),
    },
    {
      header: 'Headline & Feedback',
      key: 'title',
      render: (row) => (
        <div>
          <div className="font-semibold text-xs text-main">{row.title}</div>
          <div className="text-xs text-muted mt-1">{row.comments}</div>
          {row.managerResponse && (
            <div className="text-xs text-primary mt-2 italic bg-subtle p-2 rounded">
              <strong>Manager Response:</strong> {row.managerResponse}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Staff Mentioned',
      key: 'staffMentioned',
      render: (row) => <span className="text-xs text-muted">{row.staffMentioned}</span>,
    },
    {
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setRespondingTo(row);
            setResponseText(row.managerResponse || '');
          }}
        >
          <Reply size={13} /> {row.managerResponse ? 'Edit Reply' : 'Reply'}
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">QUALITY ASSURANCE</span>
          <h2>Client Reviews & Feedback Resolution</h2>
          <p className="text-sm text-muted">
            Inspect pet parent satisfaction, review staff commendations, and publish official clinic resolution replies.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={feedbacks}
        searchPlaceholder="Search feedback by client, staff, category..."
        emptyMessage="No customer feedback on record."
      />

      {/* Response Modal */}
      {respondingTo && (
        <Modal
          isOpen={!!respondingTo}
          onClose={() => setRespondingTo(null)}
          title={`Respond to ${respondingTo.userName}`}
          subtitle={`Regarding review: "${respondingTo.title}"`}
          size="md"
        >
          <form onSubmit={handleSendResponse}>
            <div className="form-group">
              <label className="form-label">Client Review Comments:</label>
              <p className="text-xs text-muted p-3 bg-subtle rounded">{respondingTo.comments}</p>
            </div>

            <div className="form-group">
              <label className="form-label">Official Clinic Manager Response <span className="required">*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Thank the client or detail corrective action taken..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button type="button" className="btn btn-secondary" onClick={() => setRespondingTo(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Check size={16} /> Publish Official Response
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
