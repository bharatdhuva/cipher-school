import { SubmissionFormat, ValidationResult } from './SubmissionFormat';
import { SubmissionType } from '../enums';

export class TextSubmission implements SubmissionFormat {
  readonly type = SubmissionType.TEXT;

  constructor(public readonly content: string) {}

  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.content || this.content.trim().length === 0) {
      errors.push('Submission content cannot be empty.');
    }
    if (this.content.trim().length < 50) {
      errors.push('Submission is too short to be a meaningful design (minimum 50 characters).');
    }
    return { isValid: errors.length === 0, errors };
  }

  render(): string {
    return this.content.trim();
  }
}
