import { SubmissionFormat, ValidationResult } from './SubmissionFormat';
import { SubmissionType } from '../enums';

const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'go', 'ruby', 'kotlin',
];

export class CodeSubmission implements SubmissionFormat {
  readonly type = SubmissionType.CODE;

  constructor(
    public readonly language: string,
    public readonly content: string,
  ) {}

  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.content || this.content.trim().length === 0) {
      errors.push('Code content cannot be empty.');
    }
    if (this.content.trim().length < 30) {
      errors.push('Code submission is too short to evaluate (minimum 30 characters).');
    }
    const lang = (this.language || 'typescript').toLowerCase();
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      errors.push(
        `Unsupported language "${this.language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}.`,
      );
    }
    return { isValid: errors.length === 0, errors };
  }

  render(): string {
    return `Language: ${this.language}\n\`\`\`\n${this.content.trim()}\n\`\`\``;
  }
}
