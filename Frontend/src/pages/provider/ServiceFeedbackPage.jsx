import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackApi } from '../../api/feedbackApi';
import { Star, MessageSquare, ShieldCheck, User } from 'lucide-react';

export const ServiceFeedbackPage = () => {
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const list = await feedbackApi.getFeedbacks();
      setFeedbacks(
        list.filter((f) => {
          const category = f.serviceCategory || '';
          const staff = (f.staffMentioned || '').toLowerCase();
          const currentName = (currentUser?.fullName || '').toLowerCase();
          return (
            category.includes('Grooming') ||
            category.includes('Boarding') ||
            category.includes('Care') ||
            category.includes('Spa') ||
            (currentName && staff.includes(currentName)) ||
            staff.includes('provider') ||
            staff.includes('kasun')
          );
        })
      );
    };
    fetchFeedback();
  }, [currentUser]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="badge badge-primary mb-1">CLIENT REVIEWS</span>
          <h2>Care Provider Service Reviews & Ratings</h2>
          <p className="text-sm text-muted">
            Feedback and direct ratings submitted by pet parents for grooming, hydrotherapy, and boarding care.
          </p>
        </div>
      </div>

      {feedbacks.length === 0 ? (
        <div className="card p-6" style={{ textAlign: 'center' }}>
          <MessageSquare size={36} style={{ margin: '0 auto 1rem', color: '#9CA3AF' }} />
          <h3 style={{ fontSize: '1.15rem', color: '#12304A', marginBottom: '0.5rem' }}>No Service Reviews Yet</h3>
          <p className="text-sm text-muted">Client reviews for grooming, boarding, and care services will appear here.</p>
        </div>
      ) : (
        <div className="grid-2">
        {feedbacks.map((f) => (
          <div key={f.feedbackId} className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < f.rating ? '#F59E0B' : 'none'}
                    color={i < f.rating ? '#F59E0B' : 'var(--border)'}
                  />
                ))}
              </div>
              <span className="badge badge-primary text-xs">{f.serviceCategory}</span>
            </div>

            <h3 style={{ fontSize: '1.15rem' }}>{f.title}</h3>
            <p className="text-sm text-muted mt-2" style={{ lineHeight: '1.6' }}>{f.comments}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-top text-xs text-muted" style={{ borderTop: '1px solid var(--border-light)' }}>
              <span>Client: <strong>{f.userName}</strong></span>
              <span>{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
