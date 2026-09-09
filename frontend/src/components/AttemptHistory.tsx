import type { Attempt } from '../api';
import { formatDate } from '../utils';

interface Props {
  attempts: Attempt[];
  currentId?: string;
  onSelect: (attempt: Attempt) => void;
}

const STATUS_PILL: Record<string, string> = {
  evaluated: 'pill-evaluated',
  evaluating: 'pill-evaluating',
  submitted: 'pill-submitted',
  failed: 'pill-failed',
  draft: 'pill-draft',
};

export function AttemptHistory({ attempts, currentId, onSelect }: Props) {
  if (attempts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No previous attempts</div>
        <div className="empty-desc">Submit your first design to see history here.</div>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h3 className="history-title">
        <span>Attempt History</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
        </span>
      </h3>
      <div className="history-list">
        {attempts.map((attempt, i) => (
          <div
            key={attempt.id}
            id={`history-item-${attempt.id}`}
            className={`history-item ${attempt.id === currentId ? 'current' : ''}`}
            onClick={() => onSelect(attempt)}
          >
            <div className="history-left">
              <span className="history-attempt-label">
                Attempt #{attempts.length - i}
              </span>
              <span className="history-date">
                {attempt.createdAt ? formatDate(attempt.createdAt) : '—'}
              </span>
            </div>
            <div className="history-right">
              {attempt.evaluationResult && (
                <span className="history-score">
                  {attempt.evaluationResult.overallScore.toFixed(1)}/10
                </span>
              )}
              <span className={`status-pill ${STATUS_PILL[attempt.status] ?? 'pill-draft'}`}>
                {attempt.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
