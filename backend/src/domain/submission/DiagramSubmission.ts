import { SubmissionFormat, ValidationResult } from './SubmissionFormat';
import { SubmissionType } from '../enums';

/**
 * DiagramSubmission accepts Mermaid text as the diagram format.
 * This proves the SubmissionFormat extensibility seam without requiring an
 * Excalidraw embed in the MVP UI. The class-diagram / classDiagram keyword
 * is required for basic structural validation.
 */
export class DiagramSubmission implements SubmissionFormat {
  readonly type = SubmissionType.DIAGRAM;

  constructor(
    public readonly diagramText: string, // raw Mermaid text
    public readonly format: 'mermaid' = 'mermaid',
  ) {}

  validate(): ValidationResult {
    const errors: string[] = [];
    if (!this.diagramText || this.diagramText.trim().length === 0) {
      errors.push('Diagram content cannot be empty.');
    }
    const lower = this.diagramText.toLowerCase();
    if (!lower.includes('class') && !lower.includes('-->')) {
      errors.push(
        'Diagram does not appear to contain class or relationship definitions. ' +
        'Please use Mermaid classDiagram syntax.',
      );
    }
    return { isValid: errors.length === 0, errors };
  }

  render(): string {
    return `[Mermaid Diagram]\n\`\`\`mermaid\n${this.diagramText.trim()}\n\`\`\``;
  }
}
