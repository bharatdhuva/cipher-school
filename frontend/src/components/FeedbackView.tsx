import type { EvaluationResult } from '../api';
import { getDimensionLabel, getScoreClass, getScoreColor } from '../utils';

type DimensionScore = EvaluationResult['dimensions'][number];

interface Props {
  result: {
    overallScore: number;
    evaluatorName: string;
    summary: string;
    dimensions: DimensionScore[];
    llmUnavailable?: boolean;
  };
}

export function FeedbackView({ result }: Props) {
  const isLlmAvailable = !result.llmUnavailable && result.evaluatorName.includes('llm');

  return (
    <div className="feedback-card page-fade-in">
      {/* Header */}
      <div className="feedback-header">
        <div className="feedback-header-left">
          <span className="feedback-label">Overall Score</span>
          <span className="overall-score">{result.overallScore.toFixed(1)}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/10</span></span>
        </div>
        <div className="evaluator-info">
          <span className={`evaluator-badge ${result.llmUnavailable ? 'llm-unavailable' : ''}`}>
            {isLlmAvailable ? '🤖 AI + Structural' : '🔍 Structural Only'}
          </span>
          {result.llmUnavailable && (
            <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>
              AI unavailable — showing structural checks
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="feedback-summary">{result.summary}</div>

      {/* Dimension breakdown */}
      <div className="dimensions-list">
        {result.dimensions.map((dim) => (
          <div key={dim.dimension} className="dimension-item">
            <div className="dimension-header">
              <span className="dimension-name">{getDimensionLabel(dim.dimension)}</span>
              <span
                className="dimension-score-text"
                style={{ color: getScoreColor(dim.score) }}
              >
                {dim.score}/{dim.maxScore}
              </span>
            </div>
            <div className="score-bar-track">
              <div
                className={`score-bar-fill ${getScoreClass(dim.score)}`}
                style={{ width: `${(dim.score / dim.maxScore) * 100}%` }}
              />
            </div>
            <div className="dimension-reasoning">{dim.reasoning}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
