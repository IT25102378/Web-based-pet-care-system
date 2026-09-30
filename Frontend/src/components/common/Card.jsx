import React from 'react';

export const Card = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  footer,
  className = '',
  hoverable = false,
  style = {},
}) => {
  const hasHeader = title || subtitle || Icon || actions;

  return (
    <div
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      style={style}
    >
      {hasHeader && (
        <div className="card-header">
          <div>
            {title && (
              <div className="card-title">
                {Icon && <Icon size={20} className="text-primary" />}
                <span>{title}</span>
              </div>
            )}
            {subtitle && <p className="text-xs text-muted mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
