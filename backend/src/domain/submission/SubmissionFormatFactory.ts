import { SubmissionFormat } from './SubmissionFormat';
import { TextSubmission } from './TextSubmission';
import { CodeSubmission } from './CodeSubmission';
import { DiagramSubmission } from './DiagramSubmission';
import { SubmissionType } from '../enums';

export type SubmissionPayload =
  | { type: SubmissionType.TEXT; content: string }
  | { type: SubmissionType.CODE; language: string; content: string }
  | { type: SubmissionType.DIAGRAM; diagramText: string; format?: 'mermaid' };

/**
 * Factory that maps raw payload → concrete SubmissionFormat instance.
 * This is the only place that knows about concrete types — callers just get
 * a SubmissionFormat and can call validate()/render() polymorphically.
 */
export class SubmissionFormatFactory {
  static create(payload: SubmissionPayload): SubmissionFormat {
    switch (payload.type) {
      case SubmissionType.TEXT:
        return new TextSubmission(payload.content);
      case SubmissionType.CODE:
        return new CodeSubmission(payload.language ?? 'typescript', payload.content);
      case SubmissionType.DIAGRAM:
        return new DiagramSubmission(payload.diagramText, payload.format ?? 'mermaid');
      default: {
        const _exhaustive: never = payload;
        throw new Error(`Unknown submission type: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }
}
