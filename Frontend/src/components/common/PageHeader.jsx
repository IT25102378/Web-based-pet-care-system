import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Standard page header used across every dashboard page.
 *
 * Props
 *  - title       (string | node)  Page title (rendered as the page's single <h1>)
 *  - subtitle    (string | node)  Short supporting description
 *  - breadcrumbs (Array<{ label, to? }>) Optional breadcrumb trail
 *  - eyebrow     (string | node)  Optional small label above the title (used when no breadcrumbs)
 *  - icon        (Lucide icon)    Optional icon shown in the eyebrow
 *  - badge       (node)           Optional status badge rendered next to the title
 *  - actions     (node)           Right-aligned primary / secondary actions
 */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  eyebrow,
  icon: Icon,
  badge,
  actions,
  className = '',
  style,
}) => {
  return (
    <header className={`page-header ${className}`} style={style}>
      <div className="page-header-main">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span className={isLast ? 'current' : ''}>{crumb.label}</span>
                  )}
                  {!isLast && <ChevronRight size={12} />}
                </React.Fragment>
              );
            })}
          </nav>
        ) : (
          (eyebrow || Icon) && (
            <div className="apple-eyebrow">
              {Icon && <Icon size={13} />}
              {eyebrow}
            </div>
          )
        )}
        <h1 className="page-title">
          {title}
          {badge}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
