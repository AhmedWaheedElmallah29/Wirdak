import React from 'react';
import type { SurahStatus } from '../../types';
import { useI18n } from '../../i18n/I18nContext';

const icons: Record<SurahStatus, string> = {
  memorized: '✓',
  reviewing: '↻',
  not_started: '○',
};

interface StatusBadgeProps {
  status: SurahStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { t } = useI18n();
  return (
    <span className={`badge-${status}`}>
      <span aria-hidden="true">{icons[status]}</span>
      {t.status[status]}
    </span>
  );
};

export default StatusBadge;
