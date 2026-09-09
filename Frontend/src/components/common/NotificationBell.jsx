import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, ExternalLink, Calendar, Heart, ShieldAlert, Package, Check } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item) => {
    if (!item.isRead) markAsRead(item.notificationId);
    if (item.link) {
      navigate(item.link);
      setIsOpen(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Appointment':
        return <Calendar size={16} color="var(--primary)" />;
      case 'Adoption':
      case 'Rescue':
        return <Heart size={16} color="var(--accent)" />;
      case 'Approval':
        return <ShieldAlert size={16} color="var(--status-warning)" />;
      case 'Inventory':
        return <Package size={16} color="var(--status-danger)" />;
      default:
        return <Bell size={16} color="var(--status-info)" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        className="btn-icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        style={{
          position: 'relative',
          background: isOpen ? 'var(--bg-muted)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: 'var(--status-danger)',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: '700',
              borderRadius: '9999px',
              minWidth: '17px',
              height: '17px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              boxShadow: '0 0 0 2px var(--bg-surface)',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxHeight: '440px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'scaleUp 0.15s ease-out',
          }}
        >
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-subtle)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge badge-primary text-xs">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={markAllAsRead}
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.notificationId}
                  onClick={() => handleNotificationClick(item)}
                  style={{
                    padding: '0.75rem 1.15rem',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    backgroundColor: item.isRead ? 'transparent' : 'var(--primary-subtle)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-muted)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = item.isRead ? 'transparent' : 'var(--primary-subtle)')
                  }
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>{getIcon(item.type)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold ${item.isRead ? 'text-main' : 'text-primary'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1" style={{ lineHeight: '1.4' }}>
                      {item.message}
                    </p>
                    <span className="text-xs" style={{ color: 'var(--text-subtle)', fontSize: '0.7rem' }}>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p className="text-sm text-muted">No notifications yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
